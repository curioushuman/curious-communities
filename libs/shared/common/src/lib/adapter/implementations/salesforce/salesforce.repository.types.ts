import { RunTypeReplica } from '../common/repository.types';

/**
 * Props for SF repo
 */
export interface SalesforceApiRepositoryProps {
  sourceName: string;
  responseRuntype: RunTypeReplica;
}

/**
 * Query operators supported
 */
export type SalesforceApiQueryOperator = 'AND' | 'OR';

/**
 * Query field
 */
export interface SalesforceApiQueryField {
  field: string;
  value: string;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type SalesforceApiFindOneProcessMethod<DomainT, ResponseT> = (
  item?: ResponseT,
  uri?: string
) => DomainT;
