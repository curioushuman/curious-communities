import { RunTypeReplica } from '../common/repository.types';

/**
 * Props for SF repo
 */
export interface TribeApiRepositoryProps {
  sourceName: string;
  sourceRuntype: RunTypeReplica;
  parentSourceName?: string;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type TribeApiFindOneProcessMethod<DomainT, SourceT> = (
  item?: SourceT,
  uri?: string
) => DomainT;

export interface TribeApiFindAllProps {
  page?: number;
  limit?: number;
}

/**
 * Type contract for processing findAll results from DynamoDB
 */
export type TribeApiFindAllProcessMethod<DomainT, SourceT> = (
  item?: SourceT
) => DomainT;

/**
 * Type contract for processing saveOne results from DynamoDB
 */
export type TribeApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
