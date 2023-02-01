import { RunTypeReplica } from '../common/repository.types';

/**
 * Props for SF repo
 */
export interface TribeApiRepositoryProps {
  sourceName: string;
  sourceRuntype: RunTypeReplica;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type TribeApiFindOneProcessMethod<DomainT, SourceT> = (
  item?: SourceT,
  uri?: string
) => DomainT;

/**
 * Type contract for processing saveOne results from DynamoDB
 */
export type TribeApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
