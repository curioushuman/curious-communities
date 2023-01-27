import {
  GetCommandInput,
  PutCommandInput,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

export type DynamoDbFindOneParams = GetCommandInput | QueryCommandInput;
export type DynamoDbSaveParams = PutCommandInput;

/**
 * Props for DynamoDbRepository
 */
export interface DynamoDbRepositoryProps {
  entityId: string;
  tableId: string;
  localIndexIds?: string[];
  globalIndexIds?: string[];
  prefix?: string;
}

/**
 * Props for DynamoDbRepository.getOne
 */
export interface DynamoDbRepositoryGetOneProps {
  primaryKey: string;
  sortKey?: string;
}

/**
 * Props for DynamoDbRepository.queryOne
 */
export interface DynamoDbRepositoryQueryOneProps {
  indexId: string;
  keyName?: string;
  value: string | number;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type DynamoDBFindOneProcessMethod<T> = (
  item?: Record<string, unknown>,
  params?: DynamoDbFindOneParams
) => T;

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type DynamoDBSaveProcessMethod<T> = (
  item?: Record<string, unknown>
) => T;
