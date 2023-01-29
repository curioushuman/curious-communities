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
      'cc-eventbus-internal'
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
     * Function: Create group
     *
     * Triggers
     * - mostly the internal event bus i.e. when course created
     * - also manually (mostly for testing)
     */
    const createCourseGroupLambdaConstruct = new LambdaEventSubscription(
      this,
      'cc-groups-course-group-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-course-group/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: internalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['course'],
          type: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    groupsTableConstruct.table.grantReadData(
      createCourseGroupLambdaConstruct.lambdaFunction
    );
    groupsTableConstruct.table.grantWriteData(
      createCourseGroupLambdaConstruct.lambdaFunction
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
