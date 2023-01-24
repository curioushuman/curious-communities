import { GetCommandInput, QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export type DynamoDbFindOneParams = GetCommandInput | QueryCommandInput;

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
