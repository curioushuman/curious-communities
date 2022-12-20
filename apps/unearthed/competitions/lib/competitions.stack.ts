import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  resourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { CompetitionsDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/competitions.construct';

/**
 * Most functions will share the same basic props
 * Variations can ben handled below in the stack definition
 */
const lambdaProps = {
  architecture: lambda.Architecture.X86_64,
  bundling: {
    minify: true,
    sourceMap: true,
    externalModules: [
      'aws-sdk',
      '@curioushuman/ue-competitions-service',
      '@curioushuman/loggable',
      '@nestjs/common',
      '@nestjs/core',
    ],
  },
  environment: {
    NODE_OPTIONS: '--enable-source-maps',
  },
  logRetention: logs.RetentionDays.ONE_DAY,
  runtime: lambda.Runtime.NODEJS_16_X,
  memorySize: 128,
  handler: 'handler',
  // timeout: cdk.Duration.minutes(1),
};

/**
 * These are the components required for the competitions stack
 *
 * TODO
 * - [ ] abstract the lambdas into Construct classes
 * - [*] -abstract the dynamodb table into Construct classes-
 */
export class CompetitionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * Competitions table
     *
     * NOTES
     * - this has been abstracted into a construct just to keep this file tidy
     * - all LSI and GSI details can be found in the construct
     */
    const competitionsTableConstruct = new CompetitionsDynamoDbConstruct(
      this,
      'competitions'
    );

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'ue-external-events';
    const [externalEventsEventBusName, externalEventsEventBusTitle] =
      resourceNameTitle(externalEventsEventBusId, 'EventBus');
    const externalEventsEventBus = events.EventBus.fromEventBusArn(
      this,
      externalEventsEventBusTitle,
      `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:${externalEventsEventBusName}`
    );

    /**
     * Required layers
     */
    const chLayerCompetitions = new ChLayerFrom(
      this,
      'ue-competitions-service'
    );
    const chLayerNodeModules = new ChLayerFrom(this, 'node-modules');
    const chLayerShared = new ChLayerFrom(this, 'shared');
    const lambdaLayers = [
      chLayerCompetitions.layer,
      chLayerNodeModules.layer,
      chLayerShared.layer,
    ];

    /**
     * Function: Create Competition
     *
     * NOTES:
     * - functionName required for importing into other stacks
     *
     * TODO:
     * - [ ] idempotency
     *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
     * - [ ] configure retry attempts (upon failure)
     */
    const [ccfName, ccfTitle] = resourceNameTitle(
      'ue-create-competition',
      'Lambda'
    );
    const createCompetitionFunction = new NodejsFunction(this, ccfTitle, {
      functionName: ccfName,
      entry: pathResolve(__dirname, '../src/infra/create-competition/main.ts'),
      layers: lambdaLayers,
      ...lambdaProps,
    });
    // ALWAYS ADD TAGS
    // TODO - add better tags
    cdk.Tags.of(createCompetitionFunction).add('identifier', ccfTitle);

    // allow create to read and write
    competitionsTableConstruct.table.grantReadData(createCompetitionFunction);
    competitionsTableConstruct.table.grantWriteData(createCompetitionFunction);

    /**
     * Rule: Create Competition when competition source is opened
     */
    const [ruleName, ruleTitle] = resourceNameTitle(
      'competition-status-updated-open',
      'Rule'
    );
    const createCompetitionRule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: externalEventsEventBus,
      description:
        'When a competition source is opened, create a competition internally',
      eventPattern: {
        detailType: ['putEvent'],
        detail: {
          object: ['competition'],
          type: ['status-updated'],
          status: ['open'],
        },
      },
    });
    createCompetitionRule.addTarget(
      new targets.LambdaFunction(createCompetitionFunction)
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
