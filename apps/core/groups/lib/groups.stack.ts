import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  resourceNameTitle,
  LambdaEventSubscription,
  ChEventBusFrom,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { GroupsDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/groups.construct';

/**
 * These are the components required for the groups stack
 *
 * TODO
 * - [ ] abstract the lambdas into Construct classes
 * - [*] -abstract the dynamodb table into Construct classes-
 */
export class GroupsStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['@curioushuman/cc-groups-service'],
    },
    layers: [] as lambda.ILayerVersion[],
  };

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    const groupsTableConstruct = new GroupsDynamoDbConstruct(this, 'groups');

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'cc-eventbus-external';
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      externalEventsEventBusId
    );

    /**
     * Required layers, additional to normal defaults
     */
    const chLayerGroups = new ChLayerFrom(this, 'cc-groups-service');
    this.lambdaProps.layers?.push(chLayerGroups.layer);

    /**
     * Function: Create Group
     */
    const createGroupFunction = new LambdaEventSubscription(
      this,
      'cc-groups-group-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-group/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['group'],
          type: ['status-updated'],
          status: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      createGroupFunction.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      createGroupFunction.lambdaFunction
    );

    /**
     * Function: Update Group
     */
    const updateGroupFunction = new LambdaEventSubscription(
      this,
      'cc-groups-group-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['group'],
          type: ['status-updated'],
          status: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      updateGroupFunction.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      updateGroupFunction.lambdaFunction
    );

    /**
     * Function: Create GroupMember
     */
    const createGroupMemberFunction = new LambdaEventSubscription(
      this,
      'cc-groups-group-member-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-group-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['group-member'],
          type: ['status-updated'],
          status: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      createGroupMemberFunction.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      createGroupMemberFunction.lambdaFunction
    );

    /**
     * Function: Update GroupMember
     */
    const updateGroupMemberFunction = new LambdaEventSubscription(
      this,
      'cc-groups-group-member-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-group-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['group-member'],
          type: ['status-updated'],
          status: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      updateGroupMemberFunction.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      updateGroupMemberFunction.lambdaFunction
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
