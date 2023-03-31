import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
  UpsertSourceMultiConstruct,
  RuleEntityEvent,
  LambdaThrottledConstruct,
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
     * Required layers, additional to normal defaults
     */
    const chLayerGroups = new ChLayerFrom(this, 'cc-groups-service');
    this.lambdaProps.layers?.push(chLayerGroups.layer);

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
      'cc-common-events-internal'
    );

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
        lambdaProps: this.lambdaProps,
        destinations: {
          onSuccess: {
            eventBus: internalEventBusConstruct.eventBus,
          },
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
     * Subscribing the lambda to the internal event bus
     */
    const upsertCourseGroupRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertCourseGroupLambdaId, 'entity-event'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: ['course-base', 'course'],
        event: ['created', 'updated'],
        outcome: ['success'],
        targets: [
          new targets.LambdaFunction(
            upsertCourseGroupLambdaConstruct.lambdaFunction
          ),
        ],
      }
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
      generateCompositeResourceId(upsertGroupSourceMultiId, 'entity-event'),
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
        targets: [
          new targets.SfnStateMachine(
            upsertGroupSourceMultiConstruct.stateMachine
          ),
        ],
      }
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
        lambdaProps: this.lambdaProps,
        destinations: {
          onSuccess: {
            eventBus: internalEventBusConstruct.eventBus,
          },
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
     * Subscribing the lambda to the internal event bus
     */
    const upsertCourseGroupMemberRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(
        upsertCourseGroupMemberLambdaId,
        'entity-event'
      ),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: ['participant', 'participant-base'],
        event: ['created', 'updated'],
        outcome: ['success'],
        targets: [
          new targets.LambdaFunction(
            upsertCourseGroupMemberLambdaConstruct.lambdaFunction
          ),
        ],
      }
    );

    /**
     * Function: Update group member multi
     *
     * Triggers
     * - course group update i.e. course opens/closes
     * - member update
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

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      updateGroupMemberMultiLambdaConstruct.lambdaFunction
    );

    /**
     * Subscribing the lambda to the internal event bus; group or member updated
     */
    const updateGroupMemberMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(
        updateGroupMemberMultiLambdaId,
        'entity-event'
      ),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: [
          'group-base',
          'group',
          { suffix: '-group-base' },
          { suffix: '-group' },
          'member-base',
          'member',
          { suffix: '-member-base' },
          { suffix: '-member' },
        ],
        event: ['updated'],
        outcome: ['success'],
        targets: [
          new targets.LambdaFunction(
            updateGroupMemberMultiLambdaConstruct.lambdaFunction
          ),
        ],
      }
    );

    /**
     * Function: Update group member
     *
     * Triggers
     * - personal SQS; triggered by update group member multi;
     *   triggered by course group update i.e. course opens/closes;
     *   triggered by member update
     *
     * NOTE: lambda destinations will not work in SQS context as
     * SQS is considered SYNCHRONOUS and destinations are only
     * triggered in ASYNCHRONOUS mode
     * Ref: https://repost.aws/questions/QUNhSAWNwVR2uEYDbuts9bLw/lambda-events-not-triggering-event-bridge-destination
     *
     * It is important to leave the destination in place so that the throttled knows
     * it needs to create the destination replacement. It also allows this lambda
     * to be used independently of the throttled version.
     */
    const updateGroupMemberLambdaId = generateCompositeResourceId(
      stackId,
      'group-member-update'
    );
    const updateGroupMemberLambdaConstruct = new LambdaConstruct(
      this,
      updateGroupMemberLambdaId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        destinations: {
          onSuccess: {
            eventBus: internalEventBusConstruct.eventBus,
          },
        },
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
     * We're also going to create a throttled wrapper for this lambda
     */
    const updateGroupMemberThrottledLambdaConstruct =
      new LambdaThrottledConstruct(this, updateGroupMemberLambdaId, {
        lambdas: {
          throttled: updateGroupMemberLambdaConstruct,
          queue: updateGroupMemberMultiLambdaConstruct,
        },
      });

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
    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      upsertGroupMemberSourceLambdaConstruct.lambdaFunction
    );

    /**
     * State machine: Upsert group member source multi
     */
    const upsertGroupMemberSourceMultiId = generateCompositeResourceId(
      stackId,
      'group-member-source-upsert-multi'
    );
    const upsertGroupMemberSourceMultiConstruct =
      new UpsertSourceMultiConstruct(this, upsertGroupMemberSourceMultiId, {
        lambdas: {
          updateDomain: undefined,
          upsertSource: upsertGroupMemberSourceLambdaConstruct,
        },
        entityId: 'group-member',
        sources: ['COMMUNITY', 'MICRO-COURSE'],
      });

    /**
     * Subscribing the state machine to the internal event bus
     */
    const upsertGroupMemberSourceMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(
        upsertGroupMemberSourceMultiId,
        'entity-event'
      ),
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
        targets: [
          new targets.SfnStateMachine(
            upsertGroupMemberSourceMultiConstruct.stateMachine
          ),
        ],
      }
    );

    /**
     * Allow the internal event bus to invoke the state machine
     */
    upsertGroupMemberSourceMultiConstruct.stateMachine.grantStartExecution(
      internalEventBusConstruct.role
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
