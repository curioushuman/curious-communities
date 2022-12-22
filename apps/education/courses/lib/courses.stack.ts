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

import { CoursesDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/courses.construct';

/**
 * These are the components required for the courses stack
 *
 * TODO
 * - [ ] abstract the lambdas into Construct classes
 * - [*] -abstract the dynamodb table into Construct classes-
 */
export class CoursesStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['@curioushuman/cc-courses-service'],
    },
    layers: [] as lambda.ILayerVersion[],
  };

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
     * Required layers, additional to normal defaults
     */
    const chLayerCourses = new ChLayerFrom(this, 'cc-courses-service');
    this.lambdaProps.layers?.push(chLayerCourses.layer);

    /**
     * Function: Create Course
     */
    const createCoursesFunction = new LambdaEventSubscription(
      this,
      'cc-courses-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-course/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventsEventBus,
        ruleDetails: {
          object: ['participant'],
          type: ['status-updated'],
          status: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      createCoursesFunction.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      createCoursesFunction.lambdaFunction
    );

    /**
     * Function: Update Course
     */
    const updateCoursesFunction = new LambdaEventSubscription(
      this,
      'cc-courses-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-course/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        eventBus: externalEventsEventBus,
        ruleDetails: {
          object: ['participant'],
          type: ['status-updated'],
          status: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateCoursesFunction.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      updateCoursesFunction.lambdaFunction
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
