import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  LambdaEventSubscription,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
  resourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { CoursesDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/courses-dynamodb.construct';
import { UpsertParticipantConstruct } from '../src/infra/upsert-participant/construct';

/**
 * These are the components required for the courses stack
 */
export class CoursesStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['@curioushuman/cc-courses-service'],
    },
    layers: [] as lambda.ILayerVersion[],
  };

  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * Courses table
     *
     * NOTES
     * - this has been abstracted into a construct just to keep this file tidy
     * - all LSI and GSI details can be found in the construct
     */
    const coursesTableConstruct = new CoursesDynamoDbConstruct(this, stackId);

    /**
     * External events eventBus
     */
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-external'
    );

    /**
     * Internal events eventBus
     */
    const internalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-internal'
    );

    /**
     * Eventbridge destination for our lambdas
     *
     * Resulting event should look something like:
     *
     * {
     *   "DetailType":"Lambda Function Invocation Result - Success",
     *   "Source": "lambda",
     *   "EventBusName": "{eventBusArn}",
     *   "Detail": {
     *     ...Participant (or Course)
     *   }
     * }
     *
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_destinations-readme.html#destination-specific-json-format
     */
    const onLambdaSuccess = new destinations.EventBridgeDestination(
      internalEventBusConstruct.eventBus
    );
    // use this for any lambda that needs to send events to the internal event bus
    const lambdaPropsWithDestination: NodejsFunctionProps = {
      ...this.lambdaProps,
      onSuccess: onLambdaSuccess,
    };

    /**
     * Required layers, additional to normal defaults
     */
    const chLayerCourses = new ChLayerFrom(this, 'cc-courses-service');
    this.lambdaProps.layers?.push(chLayerCourses.layer);

    /**
     * Functions
     */

    /**
     * Function: Upsert Course
     *
     * NOTE: create and update have both been removed for now
     */
    const upsertCourseLambdaConstruct = new LambdaEventSubscription(
      this,
      generateCompositeResourceId(stackId, 'course-upsert'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-course/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetailType: 'putEvent',
        ruleDetails: {
          object: ['course'],
          type: ['created', 'updated'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );
    // add salesforce env vars
    upsertCourseLambdaConstruct.addEnvironmentSalesforce();

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      upsertCourseLambdaConstruct.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      upsertCourseLambdaConstruct.lambdaFunction
    );

    /**
     * Find Course
     */
    const findCourseLambdaConstruct = new LambdaConstruct(
      this,
      generateCompositeResourceId(stackId, 'course-find'),
      {
        lambdaEntry: pathResolve(__dirname, '../src/infra/find-course/main.ts'),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      findCourseLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Create Participant
     */
    const createParticipantFunction = new LambdaEventSubscription(
      this,
      generateCompositeResourceId(stackId, 'participant-create'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-participant/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetailType: 'putEvent',
        ruleDetails: {
          object: ['participant'],
          type: ['created'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );
    // add salesforce env vars
    createParticipantFunction.addEnvironmentSalesforce();

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      createParticipantFunction.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      createParticipantFunction.lambdaFunction
    );

    /**
     * Function: Update Participant
     */
    const updateParticipantFunction = new LambdaEventSubscription(
      this,
      generateCompositeResourceId(stackId, 'participant-update'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-participant/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetailType: 'putEvent',
        ruleDetails: {
          object: ['participant'],
          type: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );
    // add salesforce env vars
    updateParticipantFunction.addEnvironmentSalesforce();

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateParticipantFunction.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      updateParticipantFunction.lambdaFunction
    );

    /**
     * Function: Find Participant
     */
    const findPaxLambdaConstruct = new LambdaConstruct(
      this,
      generateCompositeResourceId(stackId, 'participant-find'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/find-participant/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      findPaxLambdaConstruct.lambdaFunction
    );

    /**
     * Find Participant source
     */
    const findPaxSourceLambdaConstruct = new LambdaConstruct(
      this,
      generateCompositeResourceId(stackId, 'participant-source-find'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/find-participant-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    // add salesforce env vars
    findPaxSourceLambdaConstruct.addEnvironmentSalesforce();

    /**
     * State machine: Upsert participant
     */
    const upsertParticipantId = generateCompositeResourceId(
      stackId,
      'participant-upsert'
    );
    const upsertParticipantConstruct = new UpsertParticipantConstruct(
      this,
      upsertParticipantId,
      {
        lambdas: {
          findCourse: findCourseLambdaConstruct,
          findParticipant: findPaxLambdaConstruct,
          findParticipantSource: findPaxSourceLambdaConstruct,
          createParticipant: createParticipantFunction,
          updateParticipant: updateParticipantFunction,
        },
      }
    );

    /**
     * Allow the internal event bus to invoke the state machine
     */
    upsertParticipantConstruct.stateMachine.grantStartExecution(
      externalEventBusConstruct.role
    );

    /**
     * Subscribing the state machine to the external event bus
     */
    const [upsertParticipantRuleName, upsertParticipantRuleTitle] =
      resourceNameTitle(upsertParticipantId, 'Rule');
    const rule = new events.Rule(this, upsertParticipantRuleTitle, {
      ruleName: upsertParticipantRuleName,
      eventBus: externalEventBusConstruct.eventBus,
      description: 'Upsert participant, based on external event',
      eventPattern: {
        detailType: ['putEvent'],
        detail: {
          object: ['participant'],
          type: ['created', 'updated'],
        },
      },
    });
    rule.addTarget(
      new targets.SfnStateMachine(upsertParticipantConstruct.stateMachine)
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
