import { OnModuleDestroy } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { captureAWSv3Client } from 'aws-xray-sdk-core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { LoggableLogger } from '@curioushuman/loggable';

import { DynamoDbDiscriminatedItem, DynamoDbItem } from './entities/item';
import {
  DynamoDBFindAllProcessMethod,
  DynamoDbFindAllResponse,
  DynamoDbFindOneParams,
  DynamoDBFindOneProcessMethod,
  DynamoDbRepositoryFindAllProps,
  DynamoDbRepositoryGetOneProps,
  DynamoDbRepositoryProps,
  DynamoDbRepositoryQueryAllProps,
  DynamoDbRepositoryQueryOneProps,
  DynamoDbSaveParams,
  DynamoDBSaveProcessMethod,
} from './__types__';
import { confirmEnvVars, dashToCamelCase } from '../../../utils/functions';

/**
 * A base repository for DynamoDb
 *
 * TODO:
 * - [ ] can we do something about the use of Record<string, unknown>
 *       instead of DynamoDbDiscriminatedItem<PersistenceT>.
 *       DDB will only accept that it returns Record<string, unknown>,
 *       but... we need to intercept that fact here.
 */
export class DynamoDbRepository<DomainT, PersistenceT>
  implements OnModuleDestroy
{
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  /**
   * This stuff must mirror what's in the CDK stack and cdk-utils
   */
  private awsResourceTable = 'DynamoDbTable';
  private awsResourceTypeLsi = 'DynamoDbLSI';
  private awsResourceTypeGsi = 'DynamoDbGSI';

  private prefix!: string;
  private entityName!: string;
  private tableId!: string;
  private tableName!: string;
  private localIndexes!: Record<string, string>;
  private globalIndexes!: Record<string, string>;

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

  private preparePrefix(prefix: string | undefined): void {
    const envPrefix = process.env.AWS_NAME_PREFIX || '';
    this.prefix = this.prepareName(prefix || envPrefix);
  }

  private prepareEntity(id: string): void {
    this.entityName = this.prepareName(id);
  }

  private prepareTable(id: string): void {
    this.tableId = id;
    const suffix = this.awsResourceTable;
    this.tableName = `${this.prefix}${this.prepareName(id)}${suffix}`;
  }

  private prepareIndexes(
    indexIds: string[],
    indexType: string
  ): Record<string, string> {
    const prefixes = [
      this.prefix,
      this.prepareName(this.tableId),
      this.entityName,
    ];
    const prefix = prefixes.join('');
    const suffix = indexType;
    const indexes: Record<string, string> = {};
    indexIds.forEach(
      (indexId) =>
        (indexes[indexId] = `${prefix}${this.prepareName(indexId)}${suffix}`)
    );
    return indexes;
  }

  private prepareLocalIndexes(indexIds: string[] | undefined): void {
    if (!indexIds) {
      return;
    }
    this.localIndexes = this.prepareIndexes(indexIds, this.awsResourceTypeLsi);
  }

  private prepareGlobalIndexes(indexIds: string[] | undefined): void {
    if (!indexIds) {
      return;
    }
    this.globalIndexes = this.prepareIndexes(indexIds, this.awsResourceTypeGsi);
  }

  constructor(props: DynamoDbRepositoryProps, private logger: LoggableLogger) {
    const { entityId, tableId, localIndexIds, globalIndexIds, prefix } = props;
    // set the resources, in order
    this.preparePrefix(prefix);
    this.prepareEntity(entityId);
    this.prepareTable(tableId);
    this.prepareLocalIndexes(localIndexIds);
    this.prepareGlobalIndexes(globalIndexIds);

    // prepare the DDB clients
    confirmEnvVars(['AWS_REGION']);
    // wrap it in the AWS X-Ray SDK
    this.client = captureAWSv3Client(
      new DynamoDBClient({ region: process.env.AWS_REGION })
    );
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

  public static prepareErrorMessage(
    errorMsg: string,
    params?: DynamoDbFindOneParams | DynamoDbSaveParams
  ) {
    let msg = errorMsg;
    if (params) {
      msg += `: ${JSON.stringify(params)}`;
    }
    return msg;
  }

  /**
   * Convenience function to build params for the get command
   */
  public prepareParamsGet(
    props: DynamoDbRepositoryGetOneProps
  ): GetCommandInput {
    const params = {
      TableName: this.tableName,
      Key: props,
    };
    this.logger.debug('prepareParamsQueryOne', params);
    return params;
  }

  /**
   * Convenience function to build params for the get command
   * when used in a findOne context.
   */
  public prepareParamsGetOne(
    props: DynamoDbRepositoryGetOneProps
  ): GetCommandInput {
    const { primaryKey, sortKey } = props;
    // if only the primary key is provided
    // we assume they want the parent record
    // our pattern for parent records is for pk and sk to match
    const sk = sortKey || primaryKey;
    return this.prepareParamsGet({
      primaryKey,
      sortKey: sk,
    });
  }

  /**
   * Convenience function to build params for the query command when
   * used in a findOne context. i.e. we're querying with the knowledge
   * there will be only one result.
   *
   * NOTE: this function relies on the fact you'll have set up GSI's
   * for each of the identifiers.
   *
   * NOTES:
   * - we use filter expression to only return the requested record
   *   i.e. within the given index, the key is props.value but there
   *   could be numerous records of varying types. The point of this
   *   function is to return one record, of the type specified by this
   *   repository. So we use entityType to filter out the rest.
   */
  public prepareParamsQueryOne(
    props: DynamoDbRepositoryQueryOneProps
  ): QueryCommandInput {
    const { indexId, keyName, value } = props;
    const kName = keyName || this.prepareName(indexId);
    const primaryKey = `${this.entityName}_${kName}`;
    const KeyConditionExpression = `${primaryKey} = :v`;
    const params = {
      KeyConditionExpression,
      FilterExpression: 'entityType = :e',
      ExpressionAttributeValues: {
        ':v': value,
        ':e': this.entityName,
      },
      TableName: this.tableName,
      IndexName: this.globalIndexes[indexId],
    };
    this.logger.debug(params, 'prepareParamsQueryOne');
    return params;
  }

  private prepareFiltersFindAll(
    props: DynamoDbRepositoryFindAllProps
  ): Pick<QueryCommandInput, 'FilterExpression' | 'ExpressionAttributeValues'> {
    // ALWAYS add the entity name filter
    const allFilters = props.filters || {};
    allFilters.entityType = this.entityName;

    // set up some useful variables
    let letterIndex = 0;
    const allLetters = 'abcdefghijklmnopqrstuvwxyz';

    // prep filters and attributes
    const filterExpressions = [];
    const attributeValues: QueryCommandInput['ExpressionAttributeValues'] = {};
    for (const [key, value] of Object.entries(allFilters)) {
      filterExpressions.push(`${key} = :${allLetters[letterIndex]}`);
      attributeValues[`:${allLetters[letterIndex]}`] = value;
      letterIndex++;
    }
    return {
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeValues: attributeValues,
    };
  }

  /**
   * Convenience function to prep for a queryAll command
   */
  public prepareParamsQueryAll(
    props: DynamoDbRepositoryQueryAllProps
  ): QueryCommandInput {
    const { indexId, keyName, keyValue } = props;
    let primaryKey = 'primaryKey';
    let IndexName: string | undefined = undefined;
    if (indexId) {
      const kName = keyName || this.prepareName(indexId);
      primaryKey = `${this.entityName}_${kName}`;
      IndexName = this.globalIndexes[indexId];
    }
    const KeyConditionExpression = `${primaryKey} = :v`;
    const preparedFilters = this.prepareFiltersFindAll(props);
    // add the primary key as well
    const ExpressionAttributeValues = {
      ...preparedFilters.ExpressionAttributeValues,
      ':v': keyValue,
    };
    return {
      KeyConditionExpression,
      FilterExpression: preparedFilters.FilterExpression,
      ExpressionAttributeValues,
      TableName: this.tableName,
      IndexName,
    };
  }

  /**
   * Convenience function to prep for a queryAll or scanAll command
   *
   * IMPORTANT: ALWAYS USE queryAll where possible i.e. include a keyName and keyValue
   */
  public prepareParamsFindAll(
    props: DynamoDbRepositoryFindAllProps
  ): QueryCommandInput | ScanCommandInput {
    const { indexId, keyName, keyValue, filters } = props;
    if (keyValue) {
      return this.prepareParamsQueryAll({
        indexId,
        keyName,
        keyValue,
        filters,
      });
    }
    const IndexName = indexId ? this.globalIndexes[indexId] : undefined;
    const preparedFilters = this.prepareFiltersFindAll(props);
    return {
      ...preparedFilters,
      TableName: this.tableName,
      IndexName,
    };
  }

  private prepareFindAllResponse(
    response: Record<string, unknown>[] | undefined,
    processResult: DynamoDBFindAllProcessMethod<DomainT>
  ): DynamoDbFindAllResponse<DomainT> {
    if (!response) {
      return [];
    }
    return response.map(processResult);
  }

  /**
   * Adding a discriminator to the item
   * Will help with queries
   */
  private prepareDiscriminatedType(
    item: DynamoDbItem<PersistenceT>
  ): DynamoDbDiscriminatedItem<PersistenceT> {
    return {
      ...item,
      entityType: this.entityName,
    };
  }

  /**
   * Removing the discriminator from the item
   */
  private prepareNonDiscriminatedType(
    item: Record<string, unknown>
  ): Record<string, unknown> {
    if ('entityType' in item) {
      // we don't need to use the entityType
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { entityType, ...rest } = item;
      return rest;
    }
    return item;
  }

  /**
   * Convenience function to build params for the put command
   */
  public preparePutParams(item: DynamoDbItem<PersistenceT>): PutCommandInput {
    return {
      TableName: this.tableName,
      Item: this.prepareDiscriminatedType(item),
    };
  }

  public tryGetOne = (
    params: GetCommandInput,
    processResult: DynamoDBFindOneProcessMethod<DomainT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new GetCommand(params));

        // ? logging?
        // If anything do logging specific to GetCommand or AWS stats
        this.logger.debug(response, 'tryGetOne');

        const item = response.Item
          ? this.prepareNonDiscriminatedType(response.Item)
          : undefined;

        return processResult(item, params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  public tryQueryOne = (
    params: QueryCommandInput,
    processResult: DynamoDBFindOneProcessMethod<DomainT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new QueryCommand(params));

        // ? logging?
        // If anything do logging specific to QueryCommand or AWS stats
        this.logger.debug(response, 'tryQueryOne');

        const item = response.Items?.[0]
          ? this.prepareNonDiscriminatedType(response.Items?.[0])
          : undefined;

        return processResult(item, params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Obtain all records for a given item based on params
   */
  public tryQueryAll = (
    params: QueryCommandInput,
    processResult: DynamoDBFindAllProcessMethod<DomainT>
  ): TE.TaskEither<Error, DynamoDbFindAllResponse<DomainT>> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new QueryCommand(params));

        // ? logging?
        // If anything do logging specific to QueryCommand or AWS stats
        this.logger.debug(response, 'tryQueryAll');

        return this.prepareFindAllResponse(
          response.Items?.map(this.prepareNonDiscriminatedType),
          processResult
        );
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Obtain all records across DDB item collections
   */
  public tryScanAll = (
    params: ScanCommandInput,
    processResult: DynamoDBFindAllProcessMethod<DomainT>
  ): TE.TaskEither<Error, DynamoDbFindAllResponse<DomainT>> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new ScanCommand(params));

        // ? logging?
        // If anything do logging specific to QueryCommand or AWS stats
        this.logger.debug(response, 'tryScanAll');

        return this.prepareFindAllResponse(
          response.Items?.map(this.prepareNonDiscriminatedType),
          processResult
        );
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Obtain all records for a given item based on params
   */
  public tryFindAll = (
    params: QueryCommandInput | ScanCommandInput,
    processResult: DynamoDBFindAllProcessMethod<DomainT>
  ): TE.TaskEither<Error, DynamoDbFindAllResponse<DomainT>> => {
    if ('KeyConditionExpression' in params) {
      return this.tryQueryAll(params, processResult);
    }
    return this.tryScanAll(params, processResult);
  };

  /**
   * NOTE: we do not first find the course. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  public trySave = (
    params: PutCommandInput,
    processResult: DynamoDBSaveProcessMethod<DomainT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        // put the item
        const response = await this.docClient.send(new PutCommand(params));

        // process the response
        // ? should we get the response.Attributes and map back to a domain object?
        this.logger.debug(response, 'trySave');

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

  public getGlobalIndexes(): Record<string, string> {
    return this.globalIndexes;
  }

  public getEntityName(): string {
    return this.entityName;
  }
}
