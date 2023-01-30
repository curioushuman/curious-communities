import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  generateCompositeResourceId,
  resourceNameTitle,
  transformIdToResourceName,
} from '../../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Components required for the api-admin stack members:find-one resource
 *
 * NOTES
 * - no props at this time, just using the construct for abstraction purposes
 */
export class MembersDynamoDbConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // for now, we're going to use streams for testing
    const stream =
      process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
        ? dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
        : undefined;

    /**
     * Members table
     */
    const [tableName, tableTitle] = resourceNameTitle(id, 'DynamoDbTable');
    this.table = new dynamodb.Table(this, tableTitle, {
      tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'primaryKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sortKey', type: dynamodb.AttributeType.STRING },
      stream,
      // pointInTimeRecovery: true,
    });

    // destroy the table on stack deletion
    // ONLY in dev and test environments
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
      this.table.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    }

    /**
     * DynamoDb table arn output
     */
    new cdk.CfnOutput(this, `dynamoDbTableArn for ${tableTitle}`, {
      value: this.table.tableArn,
    });
    new cdk.CfnOutput(this, `dynamoDbTableStreamArn for ${tableTitle}`, {
      value: this.table.tableStreamArn || 'No stream',
    });

    // allow root to read
    this.table.grantReadData(new iam.AccountRootPrincipal());

    // Global secondary index - member.SourceIdValue
    // Identifier
    const byMemberSourceIdCRMValueIndexId = generateCompositeResourceId(
      id,
      'member-source-id-CRM'
    );
    const byMemberSourceIdCRMValueLsiName = transformIdToResourceName(
      byMemberSourceIdCRMValueIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byMemberSourceIdCRMValueLsiName,
      partitionKey: {
        name: 'Member_SourceIdCRM',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Member_SourceIdCRM',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - member.SourceIdValue
    // Identifier
    const byMemberSourceIdAUTHValueIndexId = generateCompositeResourceId(
      id,
      'member-source-id-AUTH'
    );
    const byMemberSourceIdAUTHValueLsiName = transformIdToResourceName(
      byMemberSourceIdAUTHValueIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byMemberSourceIdAUTHValueLsiName,
      partitionKey: {
        name: 'Member_SourceIdAUTH',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Member_SourceIdAUTH',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - member.SourceIdValue
    // Identifier
    const byMemberSourceIdCOMMUNITYValueIndexId = generateCompositeResourceId(
      id,
      'member-source-id-COMMUNITY'
    );
    const byMemberSourceIdCOMMUNITYValueLsiName = transformIdToResourceName(
      byMemberSourceIdCOMMUNITYValueIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byMemberSourceIdCOMMUNITYValueLsiName,
      partitionKey: {
        name: 'Member_SourceIdCOMMUNITY',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Member_SourceIdCOMMUNITY',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - member.SourceIdValue
    // Identifier
    const byMemberSourceIdMICROCOURSEValueIndexId = generateCompositeResourceId(
      id,
      'member-source-id-MICRO-COURSE'
    );
    const byMemberSourceIdMICROCOURSEValueLsiName = transformIdToResourceName(
      byMemberSourceIdMICROCOURSEValueIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byMemberSourceIdMICROCOURSEValueLsiName,
      partitionKey: {
        name: 'Member_SourceIdMICRO-COURSE',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Member_SourceIdMICRO-COURSE',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - member.email
    // Identifier
    const byMemberEmailIndexId = generateCompositeResourceId(
      id,
      'member-email'
    );
    const byMemberEmailLsiName = transformIdToResourceName(
      byMemberEmailIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byMemberEmailLsiName,
      partitionKey: {
        name: 'Member_Email',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Member_Email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
