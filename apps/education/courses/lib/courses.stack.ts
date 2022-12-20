import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  resourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { CoursesDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/courses.construct';

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
      '@curioushuman/ue-courses-service',
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
 * These are the components required for the courses stack
 *
 * TODO
 * - [ ] abstract the lambdas into Construct classes
 * - [*] -abstract the dynamodb table into Construct classes-
 */
export class CoursesStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
    const coursesTableConstruct = new CoursesDynamoDbConstruct(this, 'courses');

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
    const chLayerCourses = new ChLayerFrom(this, 'ue-courses-service');
    const chLayerNodeModules = new ChLayerFrom(this, 'node-modules');
    const chLayerShared = new ChLayerFrom(this, 'shared');
    const lambdaLayers = [
      chLayerCourses.layer,
      chLayerNodeModules.layer,
      chLayerShared.layer,
    ];

    /**
     * Function: Create Course
     *
     * NOTES:
     * - functionName required for importing into other stacks
     *
     * TODO:
     * - [ ] idempotency
     *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
     * - [ ] configure retry attempts (upon failure)
     */
    const [ccfName, ccfTitle] = resourceNameTitle('ue-create-course', 'Lambda');
    const createCourseFunction = new NodejsFunction(this, ccfTitle, {
      functionName: ccfName,
      entry: pathResolve(__dirname, '../src/infra/create-course/main.ts'),
      layers: lambdaLayers,
      ...lambdaProps,
    });
    // ALWAYS ADD TAGS
    // TODO - add better tags
    cdk.Tags.of(createCourseFunction).add('identifier', ccfTitle);

    // allow create to read and write
    coursesTableConstruct.table.grantReadData(createCourseFunction);
    coursesTableConstruct.table.grantWriteData(createCourseFunction);

    /**
     * Rule: Create Course when course source is opened
     */
    const [ruleName, ruleTitle] = resourceNameTitle(
      'course-status-updated-open',
      'Rule'
    );
    const createCourseRule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: externalEventsEventBus,
      description: 'When a course source is opened, create a course internally',
      eventPattern: {
        detailType: ['putEvent'],
        detail: {
          object: ['course'],
          type: ['status-updated'],
          status: ['open'],
        },
      },
    });
    createCourseRule.addTarget(
      new targets.LambdaFunction(createCourseFunction)
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
