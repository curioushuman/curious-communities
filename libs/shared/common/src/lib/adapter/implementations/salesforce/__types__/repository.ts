import { SalesforceApiResponse } from '.';
import { RunTypeReplica } from '../../__types__';

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
 * Type contract for processing findOne results from Salesforce API
 */
export type SalesforceApiFindOneProcessMethod<DomainT, SourceT> = (
  item?: SalesforceApiResponse<SourceT>,
  uri?: string
) => DomainT;

/**
 * Type contract for processing queryAll results from Salesforce API
 */
export type SalesforceApiQueryAllProcessMethod<DomainT, SourceT> = (
  item: SalesforceApiResponse<SourceT>
) => DomainT;

/**
 * Type contract for processing saveOne results from Salesforce API
 */
export type SalesforceApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
