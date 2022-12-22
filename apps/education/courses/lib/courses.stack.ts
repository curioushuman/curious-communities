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
import { CreateConstruct } from '../src/infra/create-course/create.construct';
import { UpdateConstruct } from '../src/infra/update-course/update.construct';

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
      '@curioushuman/cc-courses-service',
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
  layers: [] as lambda.ILayerVersion[],
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
    const externalEventsEventBusId = 'cc-external-events';
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
    const chLayerCourses = new ChLayerFrom(this, 'cc-courses-service');
    const chLayerNodeModules = new ChLayerFrom(this, 'node-modules');
    const chLayerShared = new ChLayerFrom(this, 'shared');
    lambdaProps.layers = [
      chLayerCourses.layer,
      chLayerNodeModules.layer,
      chLayerShared.layer,
    ];

    /**
     * Function: Create Course
     */
    const createConstruct = new CreateConstruct(this, 'cc-courses-create', {
      eventBus: externalEventsEventBus,
      table: coursesTableConstruct.table,
      lambdaProps,
    });

    /**
     * Function: Update Course
     */
    const updateConstruct = new UpdateConstruct(this, 'cc-courses-update', {
      eventBus: externalEventsEventBus,
      table: coursesTableConstruct.table,
      lambdaProps,
    });

    /**
     * Outputs
     * (If any)
     */
  }
}
