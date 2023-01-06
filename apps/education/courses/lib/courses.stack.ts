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

import { CoursesDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/courses-dynamodb.construct';
import { CreateParticipantConstruct } from '../src/infra/create-participant/create.construct';

/**
 * These are the components required for the courses stack
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
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-eventbus-external'
    );

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
     *     ...Participant (or Course)
     *   }
     * }
     *
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_destinations-readme.html#destination-specific-json-format
     */
    const createPaxLambdaSuccess = new destinations.EventBridgeDestination(
      internalEventBusConstruct.eventBus
    );
    // use this for any lambda that needs to send events to the internal event bus
    const lambdaPropsWithDestination: NodejsFunctionProps = {
      ...this.lambdaProps,
      onSuccess: createPaxLambdaSuccess,
    };

    /**
     * Required layers, additional to normal defaults
     */
    const chLayerCourses = new ChLayerFrom(this, 'cc-courses-service');
    this.lambdaProps.layers?.push(chLayerCourses.layer);

    /**
     * Function: Create Course
     */
    const createCourseLambdaConstruct = new LambdaEventSubscription(
      this,
      'cc-courses-course-create',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-course/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['course'],
          type: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      createCourseLambdaConstruct.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      createCourseLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Update Course
     */
    const updateCourseLambdaConstruct = new LambdaEventSubscription(
      this,
      'cc-courses-course-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-course/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['course'],
          type: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateCourseLambdaConstruct.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      updateCourseLambdaConstruct.lambdaFunction
    );

    /**
     * Find Participant
     */
    const findCourseLambdaConstruct = new LambdaConstruct(
      this,
      'cc-courses-course-find',
      {
        lambdaEntry: pathResolve(__dirname, '../src/infra/find-course/main.ts'),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      findCourseLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Open Course
     *
     * ruleDetails: {
      object: ['course'],
      type: ['status-updated'],
      status: ['open'],
    },
     */

    /**
     * Create Participant
     */
    const createParticipantConstruct = new CreateParticipantConstruct(
      this,
      'cc-courses-participant-create',
      {
        lambdaProps: lambdaPropsWithDestination,
        externalEventBus: externalEventBusConstruct.eventBus,
        table: coursesTableConstruct.table,
      }
    );

    /**
     * Function: Update Participant
     */
    const updateParticipantFunction = new LambdaEventSubscription(
      this,
      'cc-courses-participant-update',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-participant/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetails: {
          object: ['participant'],
          type: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      updateParticipantFunction.lambdaFunction
    );
    coursesTableConstruct.table.grantWriteData(
      updateParticipantFunction.lambdaFunction
    );

    /**
     * Find Participant
     */
    const findPaxLambdaConstruct = new LambdaConstruct(
      this,
      'cc-courses-participant-find',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/find-participant/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    coursesTableConstruct.table.grantReadData(
      findPaxLambdaConstruct.lambdaFunction
    );

    /**
     * Find Participant source
     */
    const findPaxSourceLambdaConstruct = new LambdaConstruct(
      this,
      'cc-courses-participant-find-source',
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/find-participant-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
