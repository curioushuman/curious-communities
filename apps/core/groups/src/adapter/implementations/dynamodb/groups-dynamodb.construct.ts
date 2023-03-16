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
 * Components required for the api-admin stack groups:find-one resource
 *
 * NOTES
 * - no props at this time, just using the construct for abstraction purposes
 */
export class GroupsDynamoDbConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, stackId: string) {
    super(scope, stackId);

    // for now, we're going to use streams for testing
    const stream =
      process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
        ? dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
        : undefined;

    /**
     * Groups table
     */
    const [tableName, tableTitle] = resourceNameTitle(stackId, 'DynamoDbTable');
    this.table = new dynamodb.Table(this, tableTitle, {
      tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'partitionKey',
        type: dynamodb.AttributeType.STRING,
      },
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

    // Global secondary index - group.SourceIdValue
    // Identifier
    const byGroupSourceIdCOMMUNITYValueIndexId = generateCompositeResourceId(
      stackId,
      'group-source-id-COMMUNITY'
    );
    const byGroupSourceIdCOMMUNITYValueGsiName = transformIdToResourceName(
      byGroupSourceIdCOMMUNITYValueIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byGroupSourceIdCOMMUNITYValueGsiName,
      partitionKey: {
        name: 'Group_SourceIdCOMMUNITY',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Group_SourceIdCOMMUNITY',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - group.SourceIdValue
    // Identifier
    const byGroupSourceIdMICROCOURSEValueIndexId = generateCompositeResourceId(
      stackId,
      'group-source-id-MICRO-COURSE'
    );
    const byGroupSourceIdMICROCOURSEValueGsiName = transformIdToResourceName(
      byGroupSourceIdMICROCOURSEValueIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byGroupSourceIdMICROCOURSEValueGsiName,
      partitionKey: {
        name: 'Group_SourceIdMICRO-COURSE',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Group_SourceIdMICRO-COURSE',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - group.slug
    // Identifier
    const byGroupSlugIndexId = generateCompositeResourceId(
      stackId,
      'group-slug'
    );
    const byGroupSlugGsiName = transformIdToResourceName(
      byGroupSlugIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byGroupSlugGsiName,
      partitionKey: {
        name: 'Group_Slug',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Group_Slug',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - group.courseId
    // Identifier
    const byGroupCourseIdIndexId = generateCompositeResourceId(
      stackId,
      'group-course-id'
    );
    const byGroupCourseIdGsiName = transformIdToResourceName(
      byGroupCourseIdIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byGroupCourseIdGsiName,
      partitionKey: {
        name: 'Group_CourseId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Group_CourseId',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - groupMember.participantId
    // Identifier
    const byGroupMemberParticipantIdIndexId = generateCompositeResourceId(
      stackId,
      'group-member-participant-id'
    );
    const byGroupMemberParticipantIdGsiName = transformIdToResourceName(
      byGroupMemberParticipantIdIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byGroupMemberParticipantIdGsiName,
      partitionKey: {
        name: 'GroupMember_ParticipantId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_GroupMember_ParticipantId',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - groupMember.memberId
    // Identifier
    const byMemberIdIndexId = generateCompositeResourceId(stackId, 'member-id');
    const byMemberIdGsiName = transformIdToResourceName(
      byMemberIdIndexId,
      'DynamoDbGSI'
    );
    this.table.addGlobalSecondaryIndex({
      indexName: byMemberIdGsiName,
      partitionKey: {
        name: 'Member_Id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Member_Id',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
