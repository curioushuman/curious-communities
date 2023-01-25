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
 * Components required for the api-admin stack courses:find-one resource
 *
 * NOTES
 * - no props at this time, just using the construct for abstraction purposes
 */
export class CoursesDynamoDbConstruct extends Construct {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // for now, we're going to use streams for testing
    const stream = dynamodb.StreamViewType.NEW_AND_OLD_IMAGES;
    process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
      ? dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
      : undefined;

    /**
     * Courses table
     */
    const [tableName, tableTitle] = resourceNameTitle(id, 'DynamoDbTable');
    this.table = new dynamodb.Table(this, tableTitle, {
      tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
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

    // Local secondary index - course.slug
    // Identifier
    const byCourseSlugLsiId = generateCompositeResourceId(id, 'course-slug');
    const byCourseSlugLsiName = transformIdToResourceName(
      byCourseSlugLsiId,
      'DynamoDbLSI'
    );
    this.table.addLocalSecondaryIndex({
      indexName: byCourseSlugLsiName,
      sortKey: { name: 'Course_Slug', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Local secondary index - participant.SourceIdValue
    // Identifier
    const byCourseSourceIdValueLsiId = generateCompositeResourceId(
      id,
      'course-source-id-value'
    );
    const byCourseSourceIdValueLsiName = transformIdToResourceName(
      byCourseSourceIdValueLsiId,
      'DynamoDbLSI'
    );
    this.table.addLocalSecondaryIndex({
      indexName: byCourseSourceIdValueLsiName,
      sortKey: {
        name: 'Course_SourceIdCOURSE',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Local secondary index - participant.SourceIdValue
    // Identifier
    const byParticipantSourceIdValueLsiId = generateCompositeResourceId(
      id,
      'participant-source-id-value'
    );
    const byParticipantSourceIdValueLsiName = transformIdToResourceName(
      byParticipantSourceIdValueLsiId,
      'DynamoDbLSI'
    );
    this.table.addLocalSecondaryIndex({
      indexName: byParticipantSourceIdValueLsiName,
      sortKey: {
        name: 'Participant_SourceIdCOURSE',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Local secondary index - EMAIL
    // Queryable
    const byParticipantEmailLsiId = generateCompositeResourceId(
      id,
      'participant-email'
    );
    const byParticipantEmailLsiName = transformIdToResourceName(
      byParticipantEmailLsiId,
      'DynamoDbLSI'
    );
    this.table.addLocalSecondaryIndex({
      indexName: byParticipantEmailLsiName,
      sortKey: {
        name: 'Participant_Email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Local secondary index - LAST NAME
    // Sort by
    const byParticipantLastNameLsiId = generateCompositeResourceId(
      id,
      'participant-last-name'
    );
    const byParticipantLastNameLsiName = transformIdToResourceName(
      byParticipantLastNameLsiId,
      'DynamoDbLSI'
    );
    this.table.addLocalSecondaryIndex({
      indexName: byParticipantLastNameLsiName,
      sortKey: {
        name: 'Participant_LastName',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
