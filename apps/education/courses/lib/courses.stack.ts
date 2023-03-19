import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
  RuleEntityEvent,
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
     */
    const upsertCourseId = generateCompositeResourceId(
      stackId,
      'course-upsert'
    );
    const upsertCourseLambdaConstruct = new LambdaConstruct(
      this,
      upsertCourseId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-course/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
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
     * Subscribing the lambda to the external event bus
     */
    const upsertCourseRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertCourseId, 'rule'),
      {
        eventBus: externalEventBusConstruct.eventBus,
        entity: ['course'],
        event: ['created', 'updated'],
        targets: [
          new targets.LambdaFunction(
            upsertCourseLambdaConstruct.lambdaFunction
          ),
        ],
      }
    );

    /**
     * Function: Find Course
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
     * Function: Open courses
     */
    const openCourseMultiLambdaId = generateCompositeResourceId(
      stackId,
      'course-open-multi'
    );
    const openCourseMultiLambdaConstruct = new LambdaConstruct(
      this,
      openCourseMultiLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/open-course-multi/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    // add salesforce env vars
    openCourseMultiLambdaConstruct.addEnvironmentSalesforce();
    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      openCourseMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Rule: Scheduled event to check for courses opening today
     */
    const [openCourseMultiRuleName, openCourseMultiRuleTitle] =
      resourceNameTitle(openCourseMultiLambdaId, 'Rule');
    const openCourseMultiRule = new events.Rule(
      this,
      openCourseMultiRuleTitle,
      {
        ruleName: openCourseMultiRuleName,
        // schedule: events.Schedule.cron({ minute: '0', hour: '16' }),
        schedule: events.Schedule.cron({ minute: '15' }),
      }
    );
    openCourseMultiRule.addTarget(
      new targets.LambdaFunction(openCourseMultiLambdaConstruct.lambdaFunction)
    );

    /**
     * Function: Update Course
     */
    const updateCourseLambdaId = generateCompositeResourceId(
      stackId,
      'course-update'
    );
    const updateCourseLambdaConstruct = new LambdaConstruct(
      this,
      updateCourseLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-course/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
      }
    );
    // add salesforce env vars
    updateCourseLambdaConstruct.addEnvironmentSalesforce();

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateCourseLambdaConstruct.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      updateCourseLambdaConstruct.lambdaFunction
    );

    /**
     * SQS queue to throttle requests to updateCourse
     */
    const [updateCourseQueueName, updateCourseQueueTitle] = resourceNameTitle(
      updateCourseLambdaId,
      'Queue'
    );
    const updateCourseQueue = new sqs.Queue(this, updateCourseQueueTitle, {
      queueName: updateCourseQueueName,
      visibilityTimeout: cdk.Duration.seconds(60),
    });
    // allow the (above) multi lambda to send messages to the queue
    updateCourseQueue.grantSendMessages(
      openCourseMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Subscribe the function, to the queue
     */
    updateCourseLambdaConstruct.lambdaFunction.addEventSource(
      new SqsEventSource(updateCourseQueue, {
        batchSize: 3, // default
        maxBatchingWindow: cdk.Duration.minutes(2),
        reportBatchItemFailures: true, // default to false
      })
    );

    /**
     * Function: Create Participant
     *
     * Triggers
     * - participant upsert step function
     *
     * NOTE: destination is not invoked when called within step functions
     */
    const createParticipantLambdaConstruct = new LambdaConstruct(
      this,
      generateCompositeResourceId(stackId, 'participant-create'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-participant/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
      }
    );
    // add salesforce env vars
    createParticipantLambdaConstruct.addEnvironmentSalesforce();

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      createParticipantLambdaConstruct.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      createParticipantLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Update Participant
     *
     * Triggers
     * - participant upsert step function
     * - personal SQS; triggered by update participant multi;
     *   triggered by course update i.e. course opens/closes;
     *   triggered by member update
     *
     * NOTE: destination is not invoked when called within step functions
     */
    const updateParticipantLambdaId = generateCompositeResourceId(
      stackId,
      'participant-update'
    );
    const updateParticipantLambdaConstruct = new LambdaConstruct(
      this,
      updateParticipantLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-participant/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
      }
    );
    // add salesforce env vars
    updateParticipantLambdaConstruct.addEnvironmentSalesforce();

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateParticipantLambdaConstruct.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      updateParticipantLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Find Participant
     */
    const findParticipantLambdaConstruct = new LambdaConstruct(
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
      findParticipantLambdaConstruct.lambdaFunction
    );

    /**
     * Find Participant source
     */
    const findParticipantSourceLambdaConstruct = new LambdaConstruct(
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
    findParticipantSourceLambdaConstruct.addEnvironmentSalesforce();

    /**
     * State machine: Upsert participant
     *
     * Triggers
     * - external event bus; participant created/updated
     * - upsert participant function;
     *   triggered by upsert participant multi;
     *   triggered by course create;
     */
    const upsertParticipantId = generateCompositeResourceId(
      stackId,
      'participant-upsert-state-machine'
    );
    const upsertParticipantConstruct = new UpsertParticipantConstruct(
      this,
      upsertParticipantId,
      {
        lambdas: {
          findCourse: findCourseLambdaConstruct,
          findParticipant: findParticipantLambdaConstruct,
          findParticipantSource: findParticipantSourceLambdaConstruct,
          createParticipant: createParticipantLambdaConstruct,
          updateParticipant: updateParticipantLambdaConstruct,
        },
        eventBus: internalEventBusConstruct.eventBus,
      }
    );

    /**
     * Allow the external event bus to invoke the state machine
     */
    upsertParticipantConstruct.stateMachine.grantStartExecution(
      externalEventBusConstruct.role
    );

    /**
     * Subscribing the state machine to the external event bus
     */
    const upsertParticipantRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertParticipantId, 'entity-event'),
      {
        eventBus: externalEventBusConstruct.eventBus,
        entity: ['participant'],
        event: ['created', 'updated'],
        targets: [
          new targets.SfnStateMachine(upsertParticipantConstruct.stateMachine),
        ],
      }
    );

    /**
     * Function: Upsert participant
     *
     * NOTE: this is here as a proxy between SQS and step functions
     *
     * Triggers
     * - personal SQS (below)
     *
     * Invokes
     * - upsertParticipant state machine
     *
     * TODO:
     * - [ ] refactor/remove to use Events Pipes (when it has L2 constructs)
     */
    const upsertParticipantLambdaId = generateCompositeResourceId(
      stackId,
      'participant-upsert'
    );
    const upsertParticipantLambdaConstruct = new LambdaConstruct(
      this,
      upsertParticipantLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-participant/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    /**
     * Allow the lambda to invoke the state machine
     */
    upsertParticipantConstruct.stateMachine.grantStartExecution(
      upsertParticipantLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Upsert participant multi
     *
     * Triggers
     * - course created
     */
    const upsertParticipantMultiLambdaId = generateCompositeResourceId(
      stackId,
      'participant-upsert-multi'
    );
    const upsertParticipantMultiLambdaConstruct = new LambdaConstruct(
      this,
      upsertParticipantMultiLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-participant-multi/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    // add salesforce env vars
    upsertParticipantMultiLambdaConstruct.addEnvironmentSalesforce();

    /**
     * Subscribing the lambda to the internal event bus; when course is created
     */
    const upsertParticipantMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(
        upsertParticipantMultiLambdaId,
        'entity-event'
      ),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: [
          'course-base',
          'course',
          { suffix: '-course-base' },
          { suffix: '-course' },
        ],
        event: ['created'],
        outcome: ['success'],
        targets: [
          new targets.LambdaFunction(
            upsertParticipantMultiLambdaConstruct.lambdaFunction
          ),
        ],
      }
    );

    /**
     * SQS queue to throttle requests to upsertParticipant
     */
    const [upsertParticipantQueueName, upsertParticipantQueueTitle] =
      resourceNameTitle(upsertParticipantLambdaId, 'Queue');
    const upsertParticipantQueue = new sqs.Queue(
      this,
      upsertParticipantQueueTitle,
      {
        queueName: upsertParticipantQueueName,
        visibilityTimeout: cdk.Duration.seconds(60),
      }
    );
    // allow the (above) multi lambda to send messages to the queue
    upsertParticipantQueue.grantSendMessages(
      upsertParticipantMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Subscribe the function, to the queue
     */
    upsertParticipantLambdaConstruct.lambdaFunction.addEventSource(
      new SqsEventSource(upsertParticipantQueue, {
        batchSize: 3, // default
        maxBatchingWindow: cdk.Duration.minutes(2),
        reportBatchItemFailures: true, // default to false
      })
    );

    /**
     * Function: Update participant multi
     *
     * Triggers
     * - course update
     * - member update
     */
    const updateParticipantMultiLambdaId = generateCompositeResourceId(
      stackId,
      'participant-update-multi'
    );
    const updateParticipantMultiLambdaConstruct = new LambdaConstruct(
      this,
      updateParticipantMultiLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-participant-multi/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateParticipantMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Subscribing the lambda to the internal event bus; when course OR member is updated
     */
    const updateParticipantMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(
        updateParticipantMultiLambdaId,
        'entity-event'
      ),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: [
          'course-base',
          'course',
          { suffix: '-course-base' },
          { suffix: '-course' },
          'member-base',
          'member',
          { suffix: '-member-base' },
          { suffix: '-member' },
        ],
        event: ['updated'],
        outcome: ['success'],
        targets: [
          new targets.LambdaFunction(
            updateParticipantMultiLambdaConstruct.lambdaFunction
          ),
        ],
      }
    );

    /**
     * SQS queue to throttle requests to updateParticipant
     */
    const [updateParticipantQueueName, updateParticipantQueueTitle] =
      resourceNameTitle(updateParticipantLambdaId, 'Queue');
    const updateParticipantQueue = new sqs.Queue(
      this,
      updateParticipantQueueTitle,
      {
        queueName: updateParticipantQueueName,
        visibilityTimeout: cdk.Duration.seconds(60),
      }
    );
    // allow the (above) multi lambda to send messages to the queue
    updateParticipantQueue.grantSendMessages(
      updateParticipantMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Subscribe the function, to the queue
     */
    updateParticipantLambdaConstruct.lambdaFunction.addEventSource(
      new SqsEventSource(updateParticipantQueue, {
        batchSize: 3, // default
        maxBatchingWindow: cdk.Duration.minutes(2),
        reportBatchItemFailures: true, // default to false
      })
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
