import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import {
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
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

    const dynamoDbTableTitle = transformIdToResourceTitle(
      this.id,
      'DynamoDbTable'
    );
    const dynamoDbTableArn = this.prepareArn(this.id);
    this.table = dynamodb.Table.fromTableArn(
      this,
      dynamoDbTableTitle,
      dynamoDbTableArn
    );

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, `dynamoDbTableArn for ${dynamoDbTableTitle}`, {
      value: dynamoDbTableArn,
    });
  }

  private prepareArn(id: ResourceId) {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    const name = transformIdToResourceName(id, 'DynamoDbTable');
    return `arn:aws:dynamodb:${cdk.Aws.REGION}:${accountId}:table/${name}`;
  }
}
