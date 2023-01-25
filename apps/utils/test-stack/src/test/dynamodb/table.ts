import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChDynamoDbTableFrom,
  generateCompositeResourceId,
  LambdaConstruct,
  testResourceId,
  testResourceNameTitle,
} from '../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Components required for the api-admin stack courses:find-one resource
 *
 * NOTES
 * - no props at this time, just using the construct for abstraction purposes
 */
export class TestDynamoDbTableConstruct extends Construct {
  constructor(scope: Construct, tableId: string) {
    super(scope, tableId);

    /**
     * Table
     */
    const tableConstruct = new ChDynamoDbTableFrom(this, tableId);

    /**
     * SQS queue that we will subscribe to all events from this table.
     * We use this to test that events have been fired via the API.
     */
    const queueId = generateCompositeResourceId(tableId, 'dynamodb-stream');
    const [tableQueueName, tableQueueTitle] = testResourceNameTitle(
      queueId,
      'Queue'
    );
    const tableQueue = new sqs.Queue(this, tableQueueTitle, {
      queueName: tableQueueName,
      retentionPeriod: cdk.Duration.hours(1),
    });

    /**
     * Destination for our lambda
     * i.e. just push the dynamodb stream events to the SQS
     * for manual monitoring
     */
    const tableQueueDestination = new destinations.SqsDestination(tableQueue);

    /**
     * Create a lambda, with our SQS destination
     */
    const tableLambdaConstruct = new LambdaConstruct(
      this,
      testResourceId('lambda-dynamodb-stream'),
      {
        lambdaEntry: pathResolve(__dirname, './main.ts'),
        lambdaProps: {
          onSuccess: tableQueueDestination,
        },
      }
    );

    /**
     * Grant relevant permissions to the lambda
     */
    tableConstruct.table.grantStreamRead(tableLambdaConstruct.lambdaFunction);

    /**
     * Add the stream as an event source for the lambda
     */
    tableLambdaConstruct.lambdaFunction.addEventSource(
      new eventsources.DynamoEventSource(tableConstruct.table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );
  }
}
