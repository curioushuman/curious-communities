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
 * Props for DynamoDbRepository.queryAll
 */
export interface DynamoDbRepositoryQueryAllProps {
  indexId?: string;
  keyName?: string;
  keyValue: string | number;
  filters?: Record<string, unknown>;
}

/**
 * Props for DynamoDbRepository.findAll
 */
export type DynamoDbRepositoryFindAllProps =
  Partial<DynamoDbRepositoryQueryAllProps>;

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
export type DynamoDBFindOneProcessMethod<DomainT> = (
  item?: Record<string, unknown>,
  params?: DynamoDbFindOneParams
) => DomainT;

/**
 * Type contract for processing findAll results from DynamoDB
 */
export type DynamoDBFindAllProcessMethod<DomainT> = (
  item: Record<string, unknown>
) => DomainT;

/**
 * Response for findAll
 */
export type DynamoDbFindAllResponse<T> = T[];

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type DynamoDBSaveProcessMethod<T> = (
  item?: Record<string, unknown>
) => T;
