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
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { MembersDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/members.construct';

/**
 * These are the components required for the members stack
 */
export class MembersStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['@curioushuman/cc-members-service'],
    },
    layers: [] as lambda.ILayerVersion[],
  };

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * Members table
     *
     * NOTES
     * - this has been abstracted into a construct just to keep this file tidy
     * - all LSI and GSI details can be found in the construct
     */
    const membersTableConstruct = new MembersDynamoDbConstruct(this, 'members');

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'cc-external-events';
    const [externalEventsEventBusName, externalEventsEventBusTitle] =
      resourceNameTitle(externalEventsEventBusId, 'EventBus');
    const externalEventsEventBus = events.EventBus.fromEventBusArn(
      this,
      externalEventsEventBusTitle,
      `arn:aws:events:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:event-bus:${externalEventsEventBusName}`
    );

    /**
     * Required layers, additional to normal defaults
     */
    const chLayerMembers = new ChLayerFrom(this, 'cc-members-service');
    this.lambdaProps.layers?.push(chLayerMembers.layer);

    /**
     * Function: Create Member
     */
    const createMemberFunction = new LambdaEventSubscription(
      this,
      'cc-members-member-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventsEventBus,
        ruleDetails: {
          object: ['member'],
          type: ['status-updated'],
          status: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      createMemberFunction.lambdaFunction
    );
    membersTableConstruct.table.grantWriteData(
      createMemberFunction.lambdaFunction
    );

    /**
     * Function: Update Member
     */
    const updateMemberFunction = new LambdaEventSubscription(
      this,
      'cc-members-member-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventsEventBus,
        ruleDetails: {
          object: ['member'],
          type: ['status-updated'],
          status: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      updateMemberFunction.lambdaFunction
    );
    membersTableConstruct.table.grantWriteData(
      updateMemberFunction.lambdaFunction
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
