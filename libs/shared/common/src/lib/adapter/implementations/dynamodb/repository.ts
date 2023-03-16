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
import { RepositoryServerError } from '@curioushuman/error-factory';

import { DynamoDbDiscriminatedItem, DynamoDbItem } from './entities/item';
import {
  DDBQueryAllCommandInputExpression,
  DDBQueryAllCommandInputExpressionValues,
  DDBQueryAllFilterValue,
  DDBQueryAllKeyValue,
  DynamoDBFindAllProcessMethod,
  DynamoDbFindAllResponse,
  DynamoDbFindOneParams,
  DynamoDBFindOneProcessMethod,
  DynamoDbRepositoryFindAllProps,
  DynamoDbRepositoryGetOneProps,
  DynamoDbRepositoryGlobalIndex,
  DynamoDbRepositoryIndex,
  DynamoDbRepositoryLocalIndex,
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
  private indexes: Record<string, DynamoDbRepositoryIndex> = {};

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

  private setPrefix(prefix: string | undefined): void {
    const envPrefix = process.env.AWS_NAME_PREFIX || '';
    this.prefix = this.prepareName(prefix || envPrefix);
  }

  private setEntity(id: string): void {
    this.entityName = this.prepareName(id);
  }

  private setTable(id: string): void {
    this.tableId = id;
    const suffix = this.awsResourceTable;
    this.tableName = `${this.prefix}${this.prepareName(id)}${suffix}`;
  }

  private setIndexes(indexes: DynamoDbRepositoryIndex[]): void {
    indexes.forEach((index) => {
      this.indexes[`${index.id}-${index.type}`] = index;
    });
  }

  /**
   * This function is used to get the index details, if an index is actually requested
   * Otherwise it returns default information for use with a DDB table.
   */
  private getIndexDetails(
    id: string | undefined,
    type = 'global'
  ): Partial<Pick<DynamoDbRepositoryIndex, 'name'>> &
    Pick<DynamoDbRepositoryIndex, 'partitionKey' | 'sortKey'> {
    if (!id) {
      return {
        name: undefined,
        partitionKey: 'partitionKey',
        sortKey: 'sortKey',
      };
    }
    const indexId = `${id}-${type}`;
    if (!(indexId in this.indexes)) {
      throw new RepositoryServerError(
        `Index ${indexId} not found. Available indexes: ${JSON.stringify(
          this.indexes
        )}`
      );
    }
    return this.indexes[indexId];
  }

  private prepareIndexName(indexId: string, suffix: string): string {
    const prefixes = [
      this.prefix,
      this.prepareName(this.tableId),
      this.entityName,
    ];
    const prefix = prefixes.join('');
    return `${prefix}${this.prepareName(indexId)}${suffix}`;
  }

  private prepareLocalIndex(
    localIndex: DynamoDbRepositoryLocalIndex
  ): DynamoDbRepositoryIndex {
    let id: string;
    let sortKey: string;
    const partitionKey = 'partitionKey';
    if (typeof localIndex === 'string') {
      id = localIndex;
      sortKey = `${this.entityName}_${this.prepareName(localIndex)}`;
    } else {
      id = localIndex.id;
      sortKey = localIndex.sortKey;
    }
    return {
      id,
      sortKey,
      partitionKey,
      name: this.prepareIndexName(id, this.awsResourceTypeLsi),
      type: 'local',
    };
  }

  private setLocalIndexes(
    indexes: DynamoDbRepositoryLocalIndex[] | undefined
  ): void {
    if (!indexes) {
      return;
    }
    const preparedIndexes = indexes.map((index) =>
      this.prepareLocalIndex(index)
    );
    this.setIndexes(preparedIndexes);
  }

  private prepareGlobalIndex(
    globalIndex: DynamoDbRepositoryGlobalIndex
  ): DynamoDbRepositoryIndex {
    let id: string;
    let sortKey: string;
    let partitionKey: string;
    if (typeof globalIndex === 'string') {
      id = globalIndex;
      partitionKey = `${this.entityName}_${this.prepareName(globalIndex)}`;
      sortKey = `Sk_${this.entityName}_${this.prepareName(globalIndex)}`;
    } else {
      id = globalIndex.id;
      sortKey = globalIndex.sortKey;
      partitionKey = globalIndex.partitionKey;
    }
    return {
      id,
      sortKey,
      partitionKey,
      name: this.prepareIndexName(id, this.awsResourceTypeGsi),
      type: 'global',
    };
  }

  private setGlobalIndexes(
    indexes: DynamoDbRepositoryGlobalIndex[] | undefined
  ): void {
    if (!indexes) {
      return;
    }
    const preparedIndexes = indexes.map((index) =>
      this.prepareGlobalIndex(index)
    );
    this.setIndexes(preparedIndexes);
  }

  constructor(props: DynamoDbRepositoryProps, private logger: LoggableLogger) {
    const { entityId, tableId, localIndexes, globalIndexes, prefix } = props;
    // set the resources, in order
    this.setPrefix(prefix);
    this.setEntity(entityId);
    this.setTable(tableId);
    this.setLocalIndexes(localIndexes);
    this.setGlobalIndexes(globalIndexes);

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
    const { partitionKey, sortKey } = props;
    // if only the primary key is provided
    // we assume they want the parent record
    // our pattern for parent records is for pk and sk to match
    const sk = sortKey || partitionKey;
    return this.prepareParamsGet({
      partitionKey,
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
   *
   * TODO:
   * - [ ] would be good to allow sortKey to be included in this as well
   */
  public prepareParamsQueryOne(
    props: DynamoDbRepositoryQueryOneProps
  ): QueryCommandInput {
    const { indexId, value } = props;
    const index = this.getIndexDetails(indexId);
    const KeyConditionExpression = `${index.partitionKey} = :pk`;
    const params = {
      KeyConditionExpression,
      FilterExpression: 'entityType = :ent',
      ExpressionAttributeValues: {
        ':pk': value,
        ':ent': this.entityName,
      },
      TableName: this.tableName,
      IndexName: index.name,
    };
    this.logger.debug(params, 'prepareParamsQueryOne');
    return params;
  }

  private prepareFilterExpressionOperator<T extends DDBQueryAllKeyValue>(
    sortKey: string,
    valueObject: T,
    fieldKey: string
  ): DDBQueryAllCommandInputExpression | undefined {
    if (!(typeof valueObject === 'object') || !('operator' in valueObject)) {
      return;
    }
    const { operator, value } = valueObject;
    const FilterExpression =
      operator === 'begins_with'
        ? `${operator}(${sortKey}, :${fieldKey})`
        : `${sortKey} ${operator} :${fieldKey}`;
    const ExpressionAttributeValues: DDBQueryAllCommandInputExpressionValues =
      {};
    ExpressionAttributeValues[`:${fieldKey}`] = value;
    return {
      FilterExpression,
      ExpressionAttributeValues,
    };
  }

  private prepareFilterExpressionRange<T extends DDBQueryAllKeyValue>(
    sortKey: string,
    valueObject: T,
    fieldKey: string
  ): DDBQueryAllCommandInputExpression | undefined {
    if (!(typeof valueObject === 'object') || !('start' in valueObject)) {
      return;
    }
    const { start, end } = valueObject;
    const FilterExpression = `${sortKey} BETWEEN :${fieldKey}Start AND :${fieldKey}End`;
    const ExpressionAttributeValues: DDBQueryAllCommandInputExpressionValues =
      {};
    ExpressionAttributeValues[`:${fieldKey}Start`] = start;
    ExpressionAttributeValues[`:${fieldKey}End`] = end;
    return {
      FilterExpression,
      ExpressionAttributeValues,
    };
  }

  private prepareFilterExpressionEquality<T extends DDBQueryAllKeyValue>(
    sortKey: string,
    value: T,
    fieldKey: string
  ): DDBQueryAllCommandInputExpression | undefined {
    if (!(typeof value == 'string' || typeof value === 'number')) {
      return;
    }
    const FilterExpression = `${sortKey} = :${fieldKey}`;
    const ExpressionAttributeValues: DDBQueryAllCommandInputExpressionValues =
      {};
    ExpressionAttributeValues[`:${fieldKey}`] = value;
    return {
      FilterExpression,
      ExpressionAttributeValues,
    };
  }

  private prepareFilterExpression<T extends DDBQueryAllKeyValue>(
    field: string,
    valueOrValueObject: T | undefined,
    fieldKey = 'sk'
  ): DDBQueryAllCommandInputExpression {
    let result: DDBQueryAllCommandInputExpression = {
      FilterExpression: undefined,
      ExpressionAttributeValues: undefined,
    };
    if (!valueOrValueObject) {
      return result;
    }
    const expressionPreparers = [
      this.prepareFilterExpressionOperator,
      this.prepareFilterExpressionRange,
      this.prepareFilterExpressionEquality,
    ];
    for (const preparer of expressionPreparers) {
      // const prepared = preparer.call(this, field, valueOrValueObject);
      const prepared = preparer(field, valueOrValueObject, fieldKey);
      if (prepared) {
        result = prepared;
      }
    }
    if (!result.FilterExpression) {
      throw new RepositoryServerError(
        `Unable to prepare filter expression for ${field} with value ${valueOrValueObject}`
      );
    }
    return result;
  }

  private prepareFilterExpressions(
    filters: Record<string, DDBQueryAllFilterValue> | undefined
  ): DDBQueryAllCommandInputExpression {
    const filterExpressions: string[] = ['entityType = :ent'];
    const ExpressionAttributeValues: DDBQueryAllCommandInputExpressionValues = {
      ':ent': this.entityName,
    };
    if (!filters) {
      return {
        FilterExpression: filterExpressions.join(' AND '),
        ExpressionAttributeValues,
      };
    }

    let letterIndex = 0;
    const allLetters = 'abcdefghijklmnopqrstuvwxyz';

    Object.entries(filters).forEach(([field, valueOrValueObject]) => {
      const filterExpression =
        this.prepareFilterExpression<DDBQueryAllFilterValue>(
          field,
          valueOrValueObject,
          `${allLetters[letterIndex++]}`
        );
      if (filterExpression.FilterExpression) {
        filterExpressions.push(filterExpression.FilterExpression);
        Object.assign(
          ExpressionAttributeValues,
          filterExpression.ExpressionAttributeValues
        );
      }
    });

    return {
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeValues,
    };
  }

  /**
   * Convenience function to prep for a queryAll command
   */
  public prepareParamsQueryAll(
    props: DynamoDbRepositoryQueryAllProps
  ): QueryCommandInput {
    const { indexId, partitionKeyValue, sortKeyValue, filters } = props;
    const index = this.getIndexDetails(indexId);

    const keyConditionExpressions = [`${index.partitionKey} = :pk`];
    const preparedSortKeyExpression = this.prepareFilterExpression(
      index.sortKey,
      sortKeyValue
    );
    if (preparedSortKeyExpression.FilterExpression) {
      keyConditionExpressions.push(preparedSortKeyExpression.FilterExpression);
    }

    const preparedFilters = this.prepareFilterExpressions(filters);
    const ExpressionAttributeValues: DDBQueryAllCommandInputExpressionValues = {
      ':pk': partitionKeyValue,
      ...preparedSortKeyExpression.ExpressionAttributeValues,
      ...preparedFilters.ExpressionAttributeValues,
    };
    const params = {
      KeyConditionExpression: keyConditionExpressions.join(' AND '),
      FilterExpression: preparedFilters.FilterExpression,
      ExpressionAttributeValues,
      TableName: this.tableName,
      IndexName: index.name,
    };
    this.logger.debug(params, 'prepareParamsQueryAll');
    return params;
  }

  /**
   * Convenience function to prep for a queryAll or scanAll command
   *
   * IMPORTANT: ALWAYS USE queryAll where possible i.e. include a partitionKeyValue
   */
  public prepareParamsFindAll(
    props: DynamoDbRepositoryFindAllProps
  ): QueryCommandInput | ScanCommandInput {
    const { indexId, partitionKeyValue, sortKeyValue, filters } = props;
    if (partitionKeyValue) {
      return this.prepareParamsQueryAll({
        indexId,
        partitionKeyValue,
        sortKeyValue,
        filters,
      });
    }
    if (sortKeyValue) {
      throw new RepositoryServerError(
        'Cannot use sortKeyValue without partitionKeyValue'
      );
    }
    const index = this.getIndexDetails(indexId);
    const IndexName = index.name;
    const preparedFilters = this.prepareFilterExpressions(filters);
    const params = {
      ...preparedFilters,
      TableName: this.tableName,
      IndexName,
    };
    this.logger.debug(params, 'prepareParamsFindAll');
    return params;
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
}
