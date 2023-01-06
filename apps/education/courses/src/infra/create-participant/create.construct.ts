import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';

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
  externalEventBus: events.IEventBus;
  internalEventBus: events.IEventBus;
  table: dynamodb.ITable;
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
     * Local lambda to create participant record
     *
     * NOTES:
     * - we are adding an eventbridge destination to announce pax creation
     */

    /**
     * Eventbridge destination for our lambda
     *
     * NOTES:
     * - we've opted for just the response from the lambda i.e. responseOnly: true
     *   https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_destinations-readme.html#auto-extract-response-payload-with-lambda-destination
     *
     * Therefore event should look something like:
     *
     * {
     *   "DetailType":"putEvent",
     *   "Source": "lambda",
     *   "EventBusName": "{eventBusArn}",
     *   "Detail": {
     *     ...Participant
     *   }
     * }
     *
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_destinations-readme.html#destination-specific-json-format
     */
    const createPaxLambdaSuccess = new destinations.EventBridgeDestination(
      props.internalEventBus
    );
    const createPaxLambdaProps: NodejsFunctionProps = {
      ...props.lambdaProps,
      onSuccess: createPaxLambdaSuccess,
    };
    const createPaxLambdaConstruct = new LambdaConstruct(this, id, {
      lambdaEntry: pathResolve(__dirname, './main.ts'),
      lambdaProps: createPaxLambdaProps,
    });

    // allow the local lambda access to the table
    props.table.grantReadData(createPaxLambdaConstruct.lambdaFunction);
    props.table.grantWriteData(createPaxLambdaConstruct.lambdaFunction);

    /**
     * Additional lambdas from other stacks
     */
    const paxFindLambdaConstruct = new ChLambdaFrom(
      this,
      'cc-courses-participant-find'
    );
    // TODO: create this lambda
    const paxSourceFindLambdaConstruct = new ChLambdaFrom(
      this,
      'cc-courses-participant-source-find'
    );
    // TODO: create this lambda
    const courseFindLambdaConstruct = new ChLambdaFrom(
      this,
      'cc-courses-course-find'
    );
    // TODO: create this lambda
    const memberCreateLambda = new ChLambdaFrom(
      this,
      'cc-members-member-create'
    );
    // TODO: create this lambda
    // this needs to be findByEmail
    // or findByIdSource and record all PAX against the member
    const memberFindLambdaConstruct = new ChLambdaFrom(
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
     *    "{\"object\":\"participant\",\"type\":\"created\",\"courseIdSourceValue\":\"{course.idSourceValue}\",\"paxIdSourceValue\":\"{pax.idSourceValue}\"}
     *  "Source": "apigw-cc-api-admin-participants-hook",
     *  "EventBusName": "eventBusArn"
     * }
     *
     * NOTES
     * - this should then be available to all lambdas as event.detail
     *
     * Step final: this is the data structure that should exist at the very end
     *
     * {
     *  "DetailType":"putEvent",
     *  "Detail":
     *    "{\"object\":\"participant\",\"type\":\"created\",\"courseIdSourceValue\":\"{course.idSourceValue}\",\"paxIdSourceValue\":\"{pax.idSourceValue}\"}
     *  "Source": "apigw-cc-api-admin-participants-hook",
     *  "EventBusName": "eventBusArn",
     *  "participantSource": {},
     *  "course": {},
     *  "member": {},
     * }
     */

    /**
     * Step 3A (Parallel): Find participant based on pax courseIdSourceValue
     */
    const findPaxSourceId = `${id}-find-participant-source`;
    const findPaxSource = new tasks.LambdaInvoke(this, findPaxSourceId, {
      lambdaFunction: paxSourceFindLambdaConstruct.lambdaFunction,
      // this append the output of this task to the input into this task
      resultPath: '$.participantSource',
    }).addCatch(sfnFail);

    /**
     * Step 3B (Parallel): Find course based on course courseIdSourceValue
     */
    const findCourseId = `${id}-find-course`;
    const findCourse = new tasks.LambdaInvoke(this, findCourseId, {
      lambdaFunction: courseFindLambdaConstruct.lambdaFunction,
      // this append the output of this task to the input into this task
      resultPath: '$.course',
    }).addCatch(sfnFail);

    /**
     * Step 3 (Parallel): Find participant and course sources
     */
    const findSourcesId = `${id}-find-sources`;
    const findSources = new sfn.Parallel(this, findSourcesId);
    findSources.branch(findPaxSource);
    findSources.branch(findCourse);

    /**
     * Step 1: Check if a participant already exists
     *
     * NOTES
     * - this lambda should behave in the same way as the others, look for dto or dto as event.detail
     *   therefore doesn't require custom inputPath
     */
    const findPaxId = `${id}-find-participant-source`;
    const findPax = new tasks.LambdaInvoke(this, findPaxId, {
      lambdaFunction: paxFindLambdaConstruct.lambdaFunction,
      // this append the output of this task to the input into this task
      resultPath: '$.participant',
    }).addCatch(sfnFail);

    /**
     * Step 2: Does PAX already exist?
     */
    const paxExistsId = `${id}-participant-exists`;
    const paxExists = new sfn.Choice(this, paxExistsId);
    // * NOTE: if PAX exists, then we should stop here
    paxExists.when(sfn.Condition.isPresent('$.participant.id'), sfnSuccess);
    // otherwise continue in the chain
    // ? is this necessary?
    paxExists.otherwise(findSources);

    /**
     * Step 4: Find member based on email
     *
     * NOTES
     * - now we'll need to locate a member based on either the email or the courseIdSourceValue of the PAX
     *   therefore we will need a custom inputPath
     */
    const findMemberId = `${id}-find-member`;
    const findMember = new tasks.LambdaInvoke(this, findMemberId, {
      lambdaFunction: memberFindLambdaConstruct.lambdaFunction,
      inputPath: '$.participantSource',
      resultPath: '$.member',
    }).addCatch(sfnFail);

    /**
     * Step 5B (Choice): Create PAX
     */
    const createPaxId = `${id}-create-participant`;
    const createPax = new tasks.LambdaInvoke(this, createPaxId, {
      lambdaFunction: createPaxLambdaConstruct.lambdaFunction,
    }).addCatch(sfnFail);

    /**
     * Step 5A (Choice): Create member
     *
     * NOTES
     * According to this example:
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions.Choice.html
     * next() back to a step in the chain should pick-up where we left off (in the chain)
     */
    const createMemberId = `${id}-create-member`;
    const createMember = new tasks.LambdaInvoke(this, createMemberId, {
      lambdaFunction: memberCreateLambda.lambdaFunction,
    })
      .addCatch(sfnFail)
      .next(findMember);
    // should then continue to memberExists

    /**
     * Step 5: Does member exist?
     *
     * Note: we're not passing inputPath or outputPath here
     * so the choice will receive the entire input from the previous step
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_stepfunctions.ChoiceProps.html
     */
    const memberExistsId = `${id}-member-exists`;
    const memberExists = new sfn.Choice(this, memberExistsId);
    memberExists.when(sfn.Condition.isNotPresent('$.member.id'), createMember);
    // otherwise continue in the chain
    // ? is this necessary?
    memberExists.otherwise(createPax);

    /**
     * Step function definition
     */
    const definition = sfn.Chain.start(findPax)
      .next(paxExists)
      .next(findSources)
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
      eventBus: props.externalEventBus,
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
