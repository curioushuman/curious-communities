import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { existsSync, readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  LambdaEventSubscription,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { CoursesDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/courses-dynamodb.construct';
import { CreateParticipantConstruct } from '../src/infra/create-participant/create.construct';

/**
 * These are the components required for the courses stack
 */
export class CoursesStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps;

  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    if (!process.env.SALESFORCE_CONSUMER_KEY) {
      throw new Error('SALESFORCE_CONSUMER_KEY is not set');
    }

    /**
     * Here, we are going to set the SF private key env var
     * from the local file we have.
     */
    const privateKeyPath = pathResolve(
      __dirname,
      '../../../../env/jwtRS256.key'
    );
    if (!existsSync(privateKeyPath)) {
      throw new Error('SALESFORCE_PRIVATE_KEY file missing');
    }
    const privateKeyBuffer = readFileSync(privateKeyPath);
    if (!privateKeyBuffer) {
      throw new Error('SALESFORCE_PRIVATE_KEY file is empty');
    }

    this.lambdaProps = {
      bundling: {
        externalModules: ['@curioushuman/cc-courses-service'],
      },
      layers: [] as lambda.ILayerVersion[],
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'test',
        SALESFORCE_CONSUMER_KEY:
          process.env.SALESFORCE_CONSUMER_KEY || 'BROKEN',
        SALESFORCE_CONSUMER_SECRET:
          process.env.SALESFORCE_CONSUMER_SECRET || 'BROKEN',
        SALESFORCE_USER: process.env.SALESFORCE_USER || 'BROKEN',
        SALESFORCE_URL_AUTH: process.env.SALESFORCE_URL_AUTH || 'BROKEN',
        SALESFORCE_URL_DATA: process.env.SALESFORCE_URL_DATA || 'BROKEN',
        SALESFORCE_URL_DATA_VERSION:
          process.env.SALESFORCE_URL_DATA_VERSION || 'BROKEN',
        SALESFORCE_PRIVATE_KEY: privateKeyBuffer.toString(),
      },
    };

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
    const coursesTableConstruct = new CoursesDynamoDbConstruct(this, stackId);

    /**
     * External events eventBus
     */
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-external'
    );

    /**
     * Internal events eventBus
     */
    const internalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-internal'
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
    const chLayerCourses = new ChLayerFrom(this, 'cc-courses-service');
    this.lambdaProps.layers?.push(chLayerCourses.layer);

    /**
     * Function: Create Course
     */
    const createCourseLambdaConstruct = new LambdaEventSubscription(
      this,
      generateCompositeResourceId(stackId, 'course-create'),
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
      generateCompositeResourceId(stackId, 'course-update'),
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
     * Find Course
     */
    const findCourseLambdaConstruct = new LambdaConstruct(
      this,
      generateCompositeResourceId(stackId, 'course-find'),
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
    // const createParticipantConstruct = new CreateParticipantConstruct(
    //   this,
    //   generateCompositeResourceId(stackId, 'participant-create'),
    //   {
    //     lambdaProps: lambdaPropsWithDestination,
    //     externalEventBus: externalEventBusConstruct.eventBus,
    //     table: coursesTableConstruct.table,
    //   }
    // );

    /**
     * Function: Update Participant
     */
    // const updateParticipantFunction = new LambdaEventSubscription(
    //   this,
    //   generateCompositeResourceId(stackId, 'participant-update'),
    //   {
    //     lambdaEntry: pathResolve(
    //       __dirname,
    //       '../src/infra/update-participant/main.ts'
    //     ),
    //     lambdaProps: lambdaPropsWithDestination,
    //     eventBus: externalEventBusConstruct.eventBus,
    //     ruleDetails: {
    //       object: ['participant'],
    //       type: ['updated'],
    //     },
    //     ruleDescription: 'Update internal, to match the external',
    //   }
    // );

    // allow the lambda access to the table
    // coursesTableConstruct.table.grantReadData(
    //   updateParticipantFunction.lambdaFunction
    // );
    // coursesTableConstruct.table.grantWriteData(
    //   updateParticipantFunction.lambdaFunction
    // );

    /**
     * Find Participant
     */
    // const findPaxLambdaConstruct = new LambdaConstruct(
    //   this,
    //   generateCompositeResourceId(stackId, 'participant-find'),
    //   {
    //     lambdaEntry: pathResolve(
    //       __dirname,
    //       '../src/infra/find-participant/main.ts'
    //     ),
    //     lambdaProps: this.lambdaProps,
    //   }
    // );

    // allow the lambda access to the table
    // coursesTableConstruct.table.grantReadData(
    //   findPaxLambdaConstruct.lambdaFunction
    // );

    /**
     * Find Participant source
     */
    // const findPaxSourceLambdaConstruct = new LambdaConstruct(
    //   this,
    //   generateCompositeResourceId(stackId, 'participant-source-find'),
    //   {
    //     lambdaEntry: pathResolve(
    //       __dirname,
    //       '../src/infra/find-participant-source/main.ts'
    //     ),
    //     lambdaProps: this.lambdaProps,
    //   }
    // );

    /**
     * Outputs
     * (If any)
     */
  }
}
