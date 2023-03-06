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
 * DDB table and indexes
 *
 * NOTES
 * - no props at this time, just using the construct for abstraction purposes
 *
 * TODO:
 * - [ ] create more fine-grained access control
 */
export class CoursesDynamoDbConstruct extends Construct {
  public table: dynamodb.Table;
  public tableName: string;

  /**
   * We could use these for fine-grained access control
   */
  public globalIndexNames: string[] = [];
  public localIndexNames: string[] = [];

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // for now, we're going to use streams for testing
    const stream =
      process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
        ? dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
        : undefined;

    /**
     * Courses table
     */
    const [tableName, tableTitle] = resourceNameTitle(id, 'DynamoDbTable');
    this.tableName = tableName;
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

    // Local secondary index - LAST NAME
    // Sort by
    const byMemberLastNameIndexId = generateCompositeResourceId(
      id,
      'member-last-name'
    );
    const byMemberLastNameLsiName = transformIdToResourceName(
      byMemberLastNameIndexId,
      'DynamoDbLSI'
    );
    this.localIndexNames.push(byMemberLastNameLsiName);
    this.table.addLocalSecondaryIndex({
      indexName: byMemberLastNameLsiName,
      sortKey: {
        name: 'Member_LastName',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - course.slug
    // Identifier
    const byCourseSlugIndexId = generateCompositeResourceId(id, 'course-slug');
    const byCourseSlugGsiName = transformIdToResourceName(
      byCourseSlugIndexId,
      'DynamoDbGSI'
    );
    this.globalIndexNames.push(byCourseSlugGsiName);
    this.table.addGlobalSecondaryIndex({
      indexName: byCourseSlugGsiName,
      partitionKey: {
        name: 'Course_Slug',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Course_Slug',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - course.SourceIdValue
    // Identifier
    const byCourseSourceIdValueIndexId = generateCompositeResourceId(
      id,
      'course-source-id-COURSE'
    );
    const byCourseSourceIdValueGsiName = transformIdToResourceName(
      byCourseSourceIdValueIndexId,
      'DynamoDbGSI'
    );
    this.globalIndexNames.push(byCourseSourceIdValueGsiName);
    this.table.addGlobalSecondaryIndex({
      indexName: byCourseSourceIdValueGsiName,
      partitionKey: {
        name: 'Course_SourceIdCOURSE',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Course_SourceIdCOURSE',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - participant.Id
    // Identifier
    const byParticipantIdIndexId = generateCompositeResourceId(
      id,
      'participant-id'
    );
    const byParticipantIdGsiName = transformIdToResourceName(
      byParticipantIdIndexId,
      'DynamoDbGSI'
    );
    this.globalIndexNames.push(byParticipantIdGsiName);
    this.table.addGlobalSecondaryIndex({
      indexName: byParticipantIdGsiName,
      partitionKey: {
        name: 'Participant_Id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Participant_Id',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - participant.SourceIdValue
    // Identifier
    const byParticipantSourceIdValueIndexId = generateCompositeResourceId(
      id,
      'participant-source-id-COURSE'
    );
    const byParticipantSourceIdValueGsiName = transformIdToResourceName(
      byParticipantSourceIdValueIndexId,
      'DynamoDbGSI'
    );
    this.globalIndexNames.push(byParticipantSourceIdValueGsiName);
    this.table.addGlobalSecondaryIndex({
      indexName: byParticipantSourceIdValueGsiName,
      partitionKey: {
        name: 'Participant_SourceIdCOURSE',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'Sk_Participant_SourceIdCOURSE',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - participant.MemberId
    // Identifier
    const byParticipantMemberIdIndexId = generateCompositeResourceId(
      id,
      'participant-member-id'
    );
    const byParticipantMemberIdGsiName = transformIdToResourceName(
      byParticipantMemberIdIndexId,
      'DynamoDbGSI'
    );
    this.globalIndexNames.push(byParticipantMemberIdGsiName);
    this.table.addGlobalSecondaryIndex({
      indexName: byParticipantMemberIdGsiName,
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

  /**
   * This is a (terrible) template for how you might grant access to a lambda
   * you could use the global and local index lists to grant access to specific
   * indexes.
   */
  // public grantFullAccess(lambda: lambda.Function) {
  //   lambda.addToRolePolicy(
  //     new iam.PolicyStatement({
  //       resources: ['*'],
  //       actions: ['dynamodb:*'],
  //     })
  //   );
  // }
}
