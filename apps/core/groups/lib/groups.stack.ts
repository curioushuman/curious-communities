import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
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
  resourceNameTitle,
  UpsertSourceMultiConstruct,
  RuleEntityEvent,
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
    const upsertCourseGroupLambdaConstruct = new LambdaConstruct(
      this,
      upsertCourseGroupLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-course-group/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
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
     * Subscribing the lambda to the internal event bus
     */
    const upsertCourseGroupRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertCourseGroupLambdaId, 'rule'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: ['course-base', 'course'],
        event: ['created', 'updated'],
        outcome: ['success'],
      }
    );
    upsertCourseGroupRuleConstruct.rule.addTarget(
      new targets.LambdaFunction(
        upsertCourseGroupLambdaConstruct.lambdaFunction
      )
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
     * Subscribing the state machine to the internal event bus
     */
    const upsertGroupSourceMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertGroupSourceMultiId, 'rule'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: ['course-group-base', 'group-base', 'standard-group-base'],
        event: ['created', 'updated'],
        outcome: ['success'],
      }
    );
    upsertGroupSourceMultiRuleConstruct.rule.addTarget(
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
    const upsertCourseGroupMemberLambdaId = generateCompositeResourceId(
      stackId,
      'course-group-member-upsert'
    );
    const upsertCourseGroupMemberLambdaConstruct = new LambdaConstruct(
      this,
      upsertCourseGroupMemberLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-course-group-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
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
     * Subscribing the lambda to the internal event bus
     */
    const upsertCourseGroupMemberRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertCourseGroupMemberLambdaId, 'rule'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: ['participant', 'participant-base'],
        event: ['created', 'updated'],
        outcome: ['success'],
      }
    );
    upsertCourseGroupMemberRuleConstruct.rule.addTarget(
      new targets.LambdaFunction(
        upsertCourseGroupMemberLambdaConstruct.lambdaFunction
      )
    );

    /**
     * Function: Update group member multi
     *
     * Triggers
     * - course group update i.e. course opens/closes
     */
    const updateGroupMemberMultiLambdaId = generateCompositeResourceId(
      stackId,
      'group-member-update-multi'
    );
    const updateGroupMemberMultiLambdaConstruct = new LambdaConstruct(
      this,
      updateGroupMemberMultiLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group-member-multi/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    /**
     * Subscribing the lambda to the internal event bus
     */
    const updateGroupMemberMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(updateGroupMemberMultiLambdaId, 'rule'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: [
          'group-base',
          'group',
          { suffix: '-group-base' },
          { suffix: '-group' },
        ],
        event: ['created', 'updated'],
        outcome: ['success'],
        // we could limit it to just the above lambda if we wanted to
        // source:{
        //   lambdas: [
        //     upsertCourseGroupLambdaConstruct.lambdaFunction
        //   ]
        // }
      }
    );
    updateGroupMemberMultiRuleConstruct.rule.addTarget(
      new targets.LambdaFunction(
        updateGroupMemberMultiLambdaConstruct.lambdaFunction
      )
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
    const upsertGroupMemberSourceLambdaId = generateCompositeResourceId(
      stackId,
      'group-member-source-upsert'
    );
    const upsertGroupMemberSourceLambdaConstruct = new LambdaConstruct(
      this,
      upsertGroupMemberSourceLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-group-member-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    upsertGroupMemberSourceLambdaConstruct.addEnvironmentEdApp();
    upsertGroupMemberSourceLambdaConstruct.addEnvironmentTribe();

    /**
     * Subscribing the lambda to the internal event bus
     */
    const upsertGroupMemberSourceRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertGroupMemberSourceLambdaId, 'rule'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: [
          'group-member-base',
          'group-member',
          { suffix: '-group-member-base' },
          { suffix: '-group-member' },
        ],
        event: ['created', 'updated'],
        outcome: ['success'],
        // we could limit it to just the above lambdas if we wanted to
        // source:{
        //   lambdas: [
        //     upsertCourseGroupMemberLambdaConstruct.lambdaFunction,
        //     updateGroupMemberLambdaConstruct.lambdaFunction,
        //   ]
        // }
      }
    );
    upsertGroupMemberSourceRuleConstruct.rule.addTarget(
      new targets.LambdaFunction(
        upsertGroupMemberSourceLambdaConstruct.lambdaFunction
      )
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
