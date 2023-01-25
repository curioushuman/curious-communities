import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

import { resourceNameTitle } from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * DynamoDbTable construct
 *
 * This type of construct makes it simpler to use an existing
 * dynamoDbTable without having to think too hard about it's ID.
 */
export class ChDynamoDbTableFrom extends Construct {
  public id: ResourceId;
  public table: dynamodb.ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    /**
     * To obtain a table with it's stream you have to use
     * Table.fromTableAttributes
     *
     * https://docs.aws.amazon.com/cdk/api/v1/docs/aws-dynamodb-readme.html#importing-existing-tables
     * https://github.com/aws/aws-cdk/issues/7470
     */
    const [dynamoDbTableName, dynamoDbTableTitle] = resourceNameTitle(
      this.id,
      'DynamoDbTable'
    );
    const dynamoDbTableArn = this.prepareArn(dynamoDbTableName);
    // will return undefined if no stream exists for this table
    const dynamoDbTableStreamArn = this.prepareStreamArn(
      dynamoDbTableName,
      scope
    );
    this.table = dynamodb.Table.fromTableAttributes(this, dynamoDbTableTitle, {
      tableArn: dynamoDbTableArn,
      tableStreamArn: dynamoDbTableStreamArn,
    });

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, `dynamoDbTableArn for ${dynamoDbTableTitle}`, {
      value: dynamoDbTableArn,
    });
    new cdk.CfnOutput(
      this,
      `dynamoDbTableStreamArn for ${dynamoDbTableTitle}`,
      {
        value: dynamoDbTableStreamArn || 'No stream',
      }
    );
  }

  private prepareArn(name: string): string {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    return `arn:aws:dynamodb:${cdk.Aws.REGION}:${accountId}:table/${name}`;
  }

  /**
   * Dynamic method of obtaining a stream ARN, from
   *
   * https://github.com/aws/aws-cdk/issues/7470
   *
   * Otherwise, they are extremely hard to work with, an e.g.
   *  arn:aws:dynamodb:ap-southeast-2:135411842270:table/CcCoursesDynamoDbTable/stream/2023-01-24T21:21:03.099
   * the last part of the ARN is a timestamp, so it's not possible to hardcode it
   *
   * NOTE
   * - this will currently only work with a single table with a stream
   * - not yet tested if streaming isn't set for the table
   */
  private prepareStreamArn(name: string, scope: Construct): string | undefined {
    const awsSdkCall: AwsSdkCall = {
      service: 'DynamoDBStreams',
      action: 'listStreams',
      region: cdk.Stack.of(scope).region,
      physicalResourceId: PhysicalResourceId.of(`${name}ListStreams`),
      parameters: {
        TableName: name,
      },
    };

    const call = new AwsCustomResource(scope, `${name}GetTableStreams`, {
      onCreate: awsSdkCall,
      onUpdate: awsSdkCall,
      logRetention: RetentionDays.ONE_DAY,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ['dynamodb:*'],
          resources: ['*'],
        }),
      ]),
    });
    return call.getResponseField('Streams.0.StreamArn');
  }
}
