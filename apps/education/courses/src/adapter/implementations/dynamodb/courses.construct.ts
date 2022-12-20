import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  resourceNameTitle,
  transformIdToResourceTitle,
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

    /**
     * Courses table
     *
     * * NOTES
     * * pk = COMP#Comp_id#TrackUploadYearMonth
     * * sk = #ModeratedStatus#TrackUploadDay
     */
    const [tableName, tableTitle] = resourceNameTitle(id, 'DynamoDbTable');
    this.table = new dynamodb.Table(this, tableTitle, {
      tableName,
      // billingMode: dynamodb.BillingMode.PROVISIONED,
      // readCapacity: 1,
      // writeCapacity: 1,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      // pointInTimeRecovery: true,
    });

    // allow root to read
    this.table.grantReadData(new iam.AccountRootPrincipal());

    // Local secondary index - STATE
    // * sk = #State#ModeratedStatus#TrackUploadDay
    this.table.addLocalSecondaryIndex({
      indexName: transformIdToResourceTitle('courses-by-state', 'DynamoDbLSI'),
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Local secondary index - AURORA REGION
    // * sk = #AuroraRegion#ModeratedStatus#TrackUploadDay
    this.table.addLocalSecondaryIndex({
      indexName: transformIdToResourceTitle('courses-by-aurora', 'DynamoDbLSI'),
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - SUB GROUP
    // * pk = COMP#Comp_id#SubGroup
    // * sk = #TrackUploadDate
    this.table.addGlobalSecondaryIndex({
      indexName: transformIdToResourceTitle(
        'courses-by-subgroup',
        'DynamoDbGSI'
      ),
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - RESULTS i.e. long list, short list, finalist, winner
    // * pk = COMP#Comp_id
    // * sk = #ResultStatus#TrackUploadDate
    this.table.addGlobalSecondaryIndex({
      indexName: transformIdToResourceTitle('courses-by-result', 'DynamoDbGSI'),
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Global secondary index - BY ARTIST NAME
    // * pk = COMP#Comp_id#ArtistNameFirstLetter
    // * sk = #ArtistName
    this.table.addGlobalSecondaryIndex({
      indexName: transformIdToResourceTitle('courses-by-artist', 'DynamoDbGSI'),
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
