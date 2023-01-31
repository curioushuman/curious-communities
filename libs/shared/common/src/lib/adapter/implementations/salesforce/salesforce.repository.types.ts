/**
 * Dirty little type hack that emulates just those parts of Runtype.Record that we need
 *
 * TODO: see if you can replace the replica with a derivative of Runtype
 */
export interface RunTypeReplica {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  omit: (key: string) => any;
  fields: Record<string, unknown>;
}

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
