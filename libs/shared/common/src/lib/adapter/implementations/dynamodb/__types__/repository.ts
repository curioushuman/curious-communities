import {
  GetCommandInput,
  PutCommandInput,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

export type DynamoDbFindOneParams = GetCommandInput | QueryCommandInput;
export type DynamoDbSaveParams = PutCommandInput;

/**
 * Interface to engage with local or global index
 */
export interface DynamoDbRepositoryIndex {
  id: string;
  sortKey: string;
  partitionKey: string;
  //---
  name: string;
  type: 'local' | 'global';
}

/**
 * Type for local index; if string, it is the id, and the rest is defaults
 */
export type DynamoDbRepositoryLocalIndex =
  | Pick<DynamoDbRepositoryIndex, 'id' | 'sortKey'>
  | string;

/**
 * Type for global index; if string, it is the id, and the rest are defaults
 */
export type DynamoDbRepositoryGlobalIndex =
  | Pick<DynamoDbRepositoryIndex, 'id' | 'sortKey' | 'partitionKey'>
  | string;

/**
 * Props for DynamoDbRepository
 */
export interface DynamoDbRepositoryProps {
  entityId: string;
  tableId: string;
  localIndexes?: DynamoDbRepositoryLocalIndex[];
  globalIndexes?: DynamoDbRepositoryGlobalIndex[];
  prefix?: string;
}

/**
 * Props for DynamoDbRepository.getOne
 */
export interface DynamoDbRepositoryGetOneProps {
  partitionKey: string;
  sortKey?: string;
}

/**
 * queryAll with operator, allowed operators
 */
type DDBQueryAllValueWithOperatorBasic = '>' | '<' | '>=' | '<=';

/**
 * queryAll with operator
 */
export interface DDBQueryAllValueWithOperator {
  operator: DDBQueryAllValueWithOperatorBasic;
  value: number;
}
/**
 * queryAll range
 */
export interface DDBQueryAllValueRange {
  start: number;
  end: number;
}
/**
 * queryAll begins with
 */
export interface DDBQueryAllValueBeginsWith {
  operator: 'begins_with';
  value: string;
}

export type DDBQueryAllKeyValueScalar = string | number;
export type DDBQueryAllFilterValueScalar = DDBQueryAllKeyValueScalar | boolean;

/**
 * queryAll key value
 *
 * i.e. all the expression types the key can support
 *
 * Ref: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.KeyConditionExpressions
 */
export type DDBQueryAllKeyValue =
  | DDBQueryAllKeyValueScalar
  | DDBQueryAllValueWithOperator
  | DDBQueryAllValueRange
  | DDBQueryAllValueBeginsWith;

/**
 * We use a cut down version of QueryCommandInput in utility functions of our repo.
 */
export type DDBQueryAllCommandInputExpression = Pick<
  QueryCommandInput,
  'FilterExpression' | 'ExpressionAttributeValues'
>;
export type DDBQueryAllCommandInputExpressionValues =
  QueryCommandInput['ExpressionAttributeValues'];

/**
 * queryAll filter value
 *
 * i.e. all the expression types the filter can support; which is a few more
 *
 * NOTE: currently the same as the KeyValue, we'll expand later
 *
 * Ref:
 * - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.KeyConditionExpressions
 * - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax
 *
 * TODO: add support for more expression types
 * - [ ] CONTAINS
 * - [ ] <>
 * - [ ] IN
 * - [ ] OR
 * - [ ] EXISTS
 * - [ ] SIZE
 */
export type DDBQueryAllFilterValue = DDBQueryAllKeyValue;

/**
 * A type to define the shape of the filters object we'll accept
 *
 * Mostly here to make sure we get the field names correct
 */
export type DynamoDbRepositoryQueryAllFilters<PersistenceT> = Partial<
  Record<keyof PersistenceT, DDBQueryAllFilterValue>
>;

/**
 * Props for DynamoDbRepository.queryAll
 */
export interface DynamoDbRepositoryQueryAllProps<PersistenceT> {
  indexId?: string;
  partitionKeyValue: string | number;
  sortKeyValue?: DDBQueryAllKeyValue;
  filters?: DynamoDbRepositoryQueryAllFilters<PersistenceT>;
}

/**
 * Props for DynamoDbRepository.findAll
 */
export type DynamoDbRepositoryFindAllProps<PersistenceT> = Partial<
  DynamoDbRepositoryQueryAllProps<PersistenceT>
>;

/**
 * Props for DynamoDbRepository.queryOne
 */
export interface DynamoDbRepositoryQueryOneProps {
  indexId?: string;
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
