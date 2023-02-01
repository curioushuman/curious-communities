import { RunTypeReplica } from '../common/repository.types';
import { SalesforceApiResponse } from './types/base-response';

/**
 * Props for SF repo
 */
export interface SalesforceApiRepositoryProps {
  sourceName: string;
  sourceRuntype: RunTypeReplica;
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
export type SalesforceApiFindOneProcessMethod<DomainT, SourceT> = (
  item?: SalesforceApiResponse<SourceT>,
  uri?: string
) => DomainT;

/**
 * Type contract for processing saveOne results from DynamoDB
 */
export type SalesforceApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
