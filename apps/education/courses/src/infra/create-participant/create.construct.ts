import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLambdaFrom,
  LambdaConstruct,
  resourceNameTitle,
} from '../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Props required
 */
export interface CreateParticipantProps {
  lambdaProps: NodejsFunctionProps;
  eventBus: events.IEventBus;
}

/**
 * Step functions definition to create a participant
 *
 * TODO
 * - [ ] add DQL to rule
 *       https://github.com/aws-samples/serverless-patterns/blob/main/cdk-eventbridge-stepfunction-sqs/cdk/lib/eventbridge-stepfunction-sqs-stack.ts
 */
export class CreateParticipantConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CreateParticipantProps) {
    super(scope, id);

    /**
     * Required lambdas
     */

    /**
     * Local lambda to create participant
     */
    const createPaxLambdaConstruct = new LambdaConstruct(this, id, {
      lambdaEntry: pathResolve(__dirname, './main.ts'),
      lambdaProps: props.lambdaProps,
    });

    /**
     * Additional lambdas from other stacks
     */
    // TODO: create this lambda
    const paxFindLambdaConstruct = new ChLambdaFrom(
      this,
      'cc-participants-participant-find'
    );
    const membersCreateLambda = new ChLambdaFrom(
      this,
      'cc-members-member-create'
    );
    // TODO: create this lambda
    // this needs to be findByEmail
    // or findByIdSource and record all PAX against the member
    const membersFindLambdaConstruct = new ChLambdaFrom(
      this,
      'cc-members-member-find'
    );

    /**
     * State machine
     *
     * TODO:
     * - [ ] better error handling in addCatch
     * - [ ] better notifications
     */

    // Our two end states
    const sfnFail = new sfn.Fail(this, 'Participant creation failed', {});
    const sfnSuccess = new sfn.Succeed(this, 'Participant creation succeeded');

    /**
     * Step 0: What should be received from the eventBus
     *
     * {
     *  "DetailType":"putEvent",
     *  "Detail":
     *    "{\"object\":\"participant\",\"type\":\"created\",\"idSource\":\"{course.idSourceValue}\",\"paxIdSource\":\"{pax.idSourceValue}\"}
     *  "Source": "apigw-cc-api-admin-participants-hook",
     *  "EventBusName": "eventBusArn"
     * }
     */

    /**
     * Step 1: Find participant based on course idSource and pax idSource
     *
     * NOTES
     * - this lambda should behave in the same way as the others, look for dto or dto as event.detail
     *   therefore doesn't require custom inputPath
     */
    const findPaxId = `${id}-find-participant`;
    const findPax = new tasks.LambdaInvoke(this, findPaxId, {
      lambdaFunction: paxFindLambdaConstruct.lambdaFunction,
      // this append the output of this task to the input into this task
      resultPath: '$.participant',
    }).addCatch(sfnFail);

    /**
     * Step 2: Find member id
     *
     * NOTES
     * - now we'll need to locate a member based on either the email or the idSource of the PAX
     *   therefore we will need a custom inputPath
     */
    const findMemberId = `${id}-find-member`;
    const findMember = new tasks.LambdaInvoke(this, findMemberId, {
      lambdaFunction: membersFindLambdaConstruct.lambdaFunction,
      inputPath: '$.participant',
      resultPath: '$.member',
    }).addCatch(sfnFail);

    /**
     * Step 4B: Create PAX
     */
    const createPaxId = `${id}-create-participant`;
    const createPax = new tasks.LambdaInvoke(this, createPaxId, {
      lambdaFunction: createPaxLambdaConstruct.lambdaFunction,
    }).addCatch(sfnFail);

    /**
     * Step 4A: Create member
     */
    const createMemberId = `${id}-create-member`;
    const createMember = new tasks.LambdaInvoke(this, createMemberId, {
      lambdaFunction: membersCreateLambda.lambdaFunction,
    })
      .addCatch(sfnFail)
      .next(findMember);

    /**
     * Step 3: Does member exist?
     *
     * Note: we're not passing inputPath or outputPath here
     * so the choice will receive the entire input from the previous step
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions.ChoiceProps.html
     */
    const memberExistsId = `${id}-member-exists`;
    const memberExists = new sfn.Choice(this, memberExistsId);
    memberExists.when(sfn.Condition.isNotPresent('$.member.id'), createMember);

    /**
     * Step function definition
     */
    const definition = sfn.Chain.start(findPax)
      .next(findMember)
      .next(memberExists)
      .next(createPax)
      .next(sfnSuccess);

    let stateMachine = new sfn.StateMachine(this, 'BookingSaga', {
      definition,
      timeout: cdk.Duration.minutes(5),
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.EXPRESS,
    });

    /**
     * Rule: Init state machine when participant is created
     */
    const [ruleName, ruleTitle] = resourceNameTitle(id, 'Rule');
    const rule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: props.eventBus,
      description: 'Create internal, to match the external',
      eventPattern: {
        detailType: ['putEvent'],
        detail: {
          object: ['participant'],
          type: ['status-updated'],
          status: ['created'],
        },
      },
    });
    // TODO: add state machine as target
    // rule.addTarget(new targets.LambdaFunction(this.lambdaFunction));
    // eventRule.addTarget(
    //   new targets.SfnStateMachine(stateMachine, {
    //     deadLetterQueue: aysncdlqQueue, // Optional: add a dead letter queue
    //     maxEventAge: cdk.Duration.hours(2), // Optional: set the maxEventAge retry policy
    //     retryAttempts: 3, // Optional: set the max number of retry attempts
    //   })
    // );
  }
}
