import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  LambdaEventSubscription,
  ChEventBusFrom,
  LambdaConstruct,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { MembersDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/members-dynamodb.construct';

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
    const membersTableConstruct = new MembersDynamoDbConstruct(
      this,
      'cc-members'
    );

    /**
     * External events eventBus
     */
    const externalEventBusConstruct = new ChEventBusFrom(this, 'cc-external');

    /**
     * Internal events eventBus
     */
    const internalEventBusConstruct = new ChEventBusFrom(this, 'cc-internal');

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
     *     ...Member
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
    const chLayerMembers = new ChLayerFrom(this, 'cc-members-service');
    this.lambdaProps.layers?.push(chLayerMembers.layer);

    /**
     * Function: Create Member
     */
    const createMemberLambdaConstruct = new LambdaEventSubscription(
      this,
      'cc-members-member-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['member'],
          type: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      createMemberLambdaConstruct.lambdaFunction
    );
    membersTableConstruct.table.grantWriteData(
      createMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Update Member
     */
    const updateMemberLambdaConstruct = new LambdaEventSubscription(
      this,
      'cc-members-member-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['member'],
          type: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      updateMemberLambdaConstruct.lambdaFunction
    );
    membersTableConstruct.table.grantWriteData(
      updateMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Find Member
     */
    const findMemberLambdaConstruct = new LambdaConstruct(
      this,
      'cc-members-member-find',
      {
        lambdaEntry: pathResolve(__dirname, '../src/infra/find-member/main.ts'),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      findMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Find Member source
     */
    const findMemberSourceLambdaConstruct = new LambdaConstruct(
      this,
      'cc-members-member-source-find',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/find-member-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    /**
     * Function: Upsert Member Source
     *
     * Subscribed to internal eventBus
     *
     * ? Maybe we should not subscribe direct to this destination style event
     * TODO: create a step function that will be able to take the raw output from
     * other lambdas, and then start the upsert loop.
     */
    const upsertMemberSourceLambdaConstruct = new LambdaEventSubscription(
      this,
      'cc-members-member-source-upsert',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-member-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: internalEventBusConstruct.eventBus,
        ruleDetailType: 'Lambda Function Invocation Result - Success',
        ruleSource: 'lambda',
        ruleDescription: 'Update internal, to match the external',
      }
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
