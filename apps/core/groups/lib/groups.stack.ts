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
  LambdaEventSubscription,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
  resourceNameTitle,
  UpsertSourceMultiConstruct,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { GroupsDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/groups-dynamodb.construct';

/**
 * These are the components required for the groups stack
 */
export class GroupsStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['@curioushuman/cc-groups-service'],
    },
    layers: [] as lambda.ILayerVersion[],
  };

  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * Groups table
     *
     * NOTES
     * - this has been abstracted into a construct just to keep this file tidy
     * - all LSI and GSI details can be found in the construct
     */
    const groupsTableConstruct = new GroupsDynamoDbConstruct(this, stackId);

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
     *     ...GroupMember (or Group)
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
    const chLayerGroups = new ChLayerFrom(this, 'cc-groups-service');
    this.lambdaProps.layers?.push(chLayerGroups.layer);

    /**
     * Function: Upsert course group
     *
     * Triggers
     * - mostly the internal event bus i.e. when course created/updated
     * - also manually (mostly for testing)
     */
    const upsertCourseGroupLambdaId = generateCompositeResourceId(
      stackId,
      'course-group-upsert'
    );
    const upsertCourseGroupLambdaConstruct = new LambdaEventSubscription(
      this,
      upsertCourseGroupLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-course-group/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: internalEventBusConstruct.eventBus,
        // NOTE: we're not including the lambda ARNs in here
        // which means this will respond to any lambda success that returns a payload of entity: course
        ruleDetails: {
          entity: ['course-base', 'course'],
          outcome: ['success'],
        },
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      upsertCourseGroupLambdaConstruct.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      upsertCourseGroupLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Update group
     *
     * Triggers
     * - called directly from step functions
     */
    const updateGroupResourceId = generateCompositeResourceId(
      stackId,
      'group-update'
    );
    const updateGroupLambdaConstruct = new LambdaConstruct(
      this,
      updateGroupResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      updateGroupLambdaConstruct.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      updateGroupLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Upsert group source
     *
     * Triggers
     * - called directly from step functions
     */
    const upsertGroupSourceResourceId = generateCompositeResourceId(
      stackId,
      'group-source-upsert'
    );
    const upsertGroupSourceLambdaConstruct = new LambdaConstruct(
      this,
      upsertGroupSourceResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-group-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    upsertGroupSourceLambdaConstruct.addEnvironmentEdApp();
    upsertGroupSourceLambdaConstruct.addEnvironmentTribe();

    /**
     * State machine: Upsert group source multi
     */
    const upsertGroupSourceMultiId = generateCompositeResourceId(
      stackId,
      'group-source-upsert-multi'
    );
    const upsertGroupSourceMultiConstruct = new UpsertSourceMultiConstruct(
      this,
      upsertGroupSourceMultiId,
      {
        lambdas: {
          updateDomain: updateGroupLambdaConstruct,
          upsertSource: upsertGroupSourceLambdaConstruct,
        },
        entityId: 'group',
        sources: ['COMMUNITY', 'MICRO-COURSE'],
      }
    );

    /**
     * Subscribing the state machine to the Upsert Course Group Lambda (destination) events
     */
    const [upsertGroupSourceMultiRuleName, upsertGroupSourceMultiRuleTitle] =
      resourceNameTitle(upsertGroupSourceMultiId, 'Rule');
    const rule = new events.Rule(this, upsertGroupSourceMultiRuleTitle, {
      ruleName: upsertGroupSourceMultiRuleName,
      eventBus: internalEventBusConstruct.eventBus,
      description: 'Upsert multiple group sources, based on internal event',
      eventPattern: {
        detailType: ['Lambda Function Invocation Result - Success'],
        source: ['lambda'],
        detail: {
          responsePayload: {
            entity: ['course-group-base', 'group-base', 'standard-group-base'],
            outcome: ['success'],
          },
        },
      },
    });
    rule.addTarget(
      new targets.SfnStateMachine(upsertGroupSourceMultiConstruct.stateMachine)
    );

    /**
     * Allow the internal event bus to invoke the state machine
     */
    upsertGroupSourceMultiConstruct.stateMachine.grantStartExecution(
      internalEventBusConstruct.role
    );

    /**
     * Function: Upsert course group member
     *
     * Triggers
     * - internal event bus i.e. when participant created/updated
     */
    const upsertCourseGroupMemberResourceId = generateCompositeResourceId(
      stackId,
      'course-group-member-upsert'
    );
    const upsertCourseGroupMemberLambdaConstruct = new LambdaEventSubscription(
      this,
      upsertCourseGroupMemberResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-course-group-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: internalEventBusConstruct.eventBus,
        // NOTE: we're not including the lambda ARNs in here
        // which means this will respond to any lambda success that returns a payload of entity: participant
        ruleDetails: {
          entity: ['participant', 'participant-base'],
          outcome: ['success'],
        },
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      upsertCourseGroupMemberLambdaConstruct.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      upsertCourseGroupMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Update group member multi
     *
     * Triggers
     * - course group update i.e. course opens/closes
     */
    const updateGroupMemberMultiResourceId = generateCompositeResourceId(
      stackId,
      'group-member-update-multi'
    );
    const updateGroupMemberMultiLambdaConstruct = new LambdaEventSubscription(
      this,
      updateGroupMemberMultiResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group-member-multi/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: internalEventBusConstruct.eventBus,
        lambdaArns: [
          upsertCourseGroupLambdaConstruct.lambdaFunction.functionArn,
        ],
        ruleDetails: {
          outcome: ['success'],
        },
      }
    );

    /**
     * Function: Update group member
     *
     * Triggers
     * - personal SQS; triggered by update group member multi;
     *   triggered by course group update i.e. course opens/closes
     */
    const updateGroupMemberResourceId = generateCompositeResourceId(
      stackId,
      'group-member-update'
    );
    const updateGroupMemberLambdaConstruct = new LambdaConstruct(
      this,
      updateGroupMemberResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      updateGroupMemberLambdaConstruct.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      updateGroupMemberLambdaConstruct.lambdaFunction
    );

    /**
     * SQS queue to throttle requests to updateGroupMember
     */
    const [updateGroupMemberQueueName, updateGroupMemberQueueTitle] =
      resourceNameTitle(updateGroupMemberResourceId, 'Queue');
    const updateGroupMemberQueue = new sqs.Queue(
      this,
      updateGroupMemberQueueTitle,
      {
        queueName: updateGroupMemberQueueName,
        visibilityTimeout: cdk.Duration.seconds(60),
      }
    );
    // allow the (above) multi lambda to send messages to the queue
    updateGroupMemberQueue.grantSendMessages(
      updateGroupMemberMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Subscribe the function, to the queue
     */
    updateGroupMemberLambdaConstruct.lambdaFunction.addEventSource(
      new SqsEventSource(updateGroupMemberQueue, {
        batchSize: 3, // default
        maxBatchingWindow: cdk.Duration.minutes(2),
        reportBatchItemFailures: true, // default to false
      })
    );

    /**
     * Function: Upsert group member source
     *
     * Triggers
     * - acts as lambda destination for upsert course group member;
     *   acts as lambda destination for update group member;
     *   triggered by course group update i.e. course opens/closes
     */
    const upsertGroupMemberSourceResourceId = generateCompositeResourceId(
      stackId,
      'group-member-source-upsert'
    );
    const upsertGroupMemberSourceLambdaConstruct = new LambdaEventSubscription(
      this,
      upsertGroupMemberSourceResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-group-member-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: internalEventBusConstruct.eventBus,
        lambdaArns: [
          upsertCourseGroupMemberLambdaConstruct.lambdaFunction.functionArn,
          updateGroupMemberLambdaConstruct.lambdaFunction.functionArn,
        ],
        ruleDetails: {
          outcome: ['success'],
        },
      }
    );
    upsertGroupMemberSourceLambdaConstruct.addEnvironmentEdApp();
    upsertGroupMemberSourceLambdaConstruct.addEnvironmentTribe();

    /**
     * Outputs
     * (If any)
     */
  }
}
