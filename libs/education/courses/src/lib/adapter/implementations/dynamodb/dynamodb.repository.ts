import { OnModuleDestroy } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { LoggableLogger } from '@curioushuman/loggable';
import { dashToCamelCase } from '@curioushuman/common';

import { DynamoDbItem } from './types/item';
import {
  DynamoDBFindOneProcessMethod,
  DynamoDBSaveProcessMethod,
} from './dynamodb.repository.types';

/**
 * A base repository for DynamoDb
 */
export class DynamoDbRepository<T> implements OnModuleDestroy {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  /**
   * This stuff must mirror what's in the CDK stack and cdk-utils
   */
  private awsResourceTable = 'DynamoDbTable';
  private awsResourceTypeLsi = 'DynamoDbLsi';
  // private gsiAwsResourceType = 'DynamoDbGsi';

  private entityName!: string;
  private tableId!: string;
  private tableName!: string;
  private localIndexes!: Record<string, string>;
  // private globalIndexes: string[];

  private marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  };
  private unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  };

  private prepareName(id: string): string {
    return dashToCamelCase(id);
  }

  private prepareEntity(id: string): void {
    this.entityName = this.prepareName(id);
  }

  private prepareTable(id: string): void {
    this.tableId = id;
    const prefix = process.env.AWS_NAME_PREFIX || '';
    const suffix = this.awsResourceTable;
    this.tableName = `${prefix}${this.prepareName(id)}${suffix}`;
  }

  private prepareLocalIndexes(indexIds: string[]): void {
    let prefix = process.env.AWS_NAME_PREFIX || '';
    prefix += `${this.prepareName(this.tableId)}${this.entityName}`;
    const suffix = this.awsResourceTypeLsi;
    const indexes: Record<string, string> = {};
    indexIds.forEach(
      (indexId) =>
        (indexes[indexId] = `${prefix}${this.prepareName(indexId)}${suffix}`)
    );
    this.localIndexes = indexes;
  }

  constructor(
    entityId: string,
    tableId: string,
    indexIds: string[],
    private logger: LoggableLogger
  ) {
    // set the resources, in order
    this.prepareEntity(entityId);
    this.prepareTable(tableId);
    this.prepareLocalIndexes(indexIds);

    // prepare the DDB clients
    this.client = new DynamoDBClient({ region: process.env.CDK_DEPLOY_REGION });
    // NOTE: this is a wrapper of the above that is designed to be simpler to use
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: this.marshallOptions,
      unmarshallOptions: this.unmarshallOptions,
    });
  }

  /**
   * A Nest.js lifecycle hook
   *
   * Based on the docs it looks like this hook will be called either
   * when the application is closed (app.close()) or when the application
   * receives a termination signal (SIGINT, SIGTERM, etc.)
   *
   * https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
   *
   * TODO:
   * - [ ] is there a way to throw an error if the module does not include the
   *       correct listeners?
   */
  onModuleDestroy() {
    this.client.destroy();
  }

  /**
   * Convenience function to build params for the get command
   */
  public prepareParamsGet(
    primaryKey: string,
    sortKey?: string
  ): GetCommandInput {
    return {
      TableName: this.tableName,
      Key: {
        primaryKey,
        sortKey,
      },
    };
  }

  /**
   * Converts a scalar value into a DDB query param attribute value
   */
  private prepareParamAttributeQuery(value: string | number) {
    return typeof value === 'number' ? { N: value } : { S: value };
  }

  /**
   * Convenience function to build params for the query command when
   * used in a findOne context. i.e. we're querying with the knowledge
   * there will be only one result.
   *
   * NOTE: this function relies on the fact you'll have set up LSI's
   * for each of the identifiers.
   */
  public prepareParamsQueryOne(
    lsiId: string,
    sortKeyName: string,
    value: string | number
  ): QueryCommandInput {
    return {
      KeyConditionExpression: `${this.entityName}_${sortKeyName} = :v`,
      ExpressionAttributeValues: {
        ':v': this.prepareParamAttributeQuery(value),
      },
      TableName: this.tableName,
      IndexName: this.localIndexes[lsiId],
    };
  }

  public tryGetOne = (
    params: GetCommandInput,
    processResult: DynamoDBFindOneProcessMethod<T>
  ): TE.TaskEither<Error, T> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new GetCommand(params));

        // ? logging?
        // If anything do logging specific to GetCommand or AWS stats
        this.logger.debug(response);

        return processResult(response.Item, params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  public tryQueryOne = (
    params: QueryCommandInput,
    processResult: DynamoDBFindOneProcessMethod<T>
  ): TE.TaskEither<Error, T> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new QueryCommand(params));

        // ? logging?
        // If anything do logging specific to QueryCommand or AWS stats
        this.logger.debug(response);

        return processResult(response.Items?.[0], params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Convenience function to build params for the put command
   */
  public preparePutParams(item: DynamoDbItem): PutCommandInput {
    return {
      TableName: this.tableName,
      Item: item,
    };
  }

  /**
   * NOTE: we do not first find the course. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  public trySave = (
    params: PutCommandInput,
    processResult: DynamoDBSaveProcessMethod<T>
  ): TE.TaskEither<Error, T> => {
    return TE.tryCatch(
      async () => {
        // put the item
        const response = await this.docClient.send(new PutCommand(params));

        // process the response
        // ? should we get the response.Attributes and map back to a domain object?
        this.logger.debug(response);

        return processResult(response.Attributes);
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Some getters, mostly for testing purposes
   */
  public getTableName(): string {
    return this.tableName;
  }

  public getLocalIndexes(): Record<string, string> {
    return this.localIndexes;
  }

  public getEntityName(): string {
    return this.entityName;
  }
}
