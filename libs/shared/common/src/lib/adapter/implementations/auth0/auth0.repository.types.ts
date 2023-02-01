import { RunTypeReplica } from '../common/repository.types';

/**
 * Props for SF repo
 */
export interface Auth0ApiRepositoryProps {
  sourceName: string;
  sourceRuntype: RunTypeReplica;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type Auth0ApiFindOneProcessMethod<DomainT, SourceT> = (
  item?: SourceT,
  uri?: string
) => DomainT;

/**
 * Type contract for processing saveOne results from DynamoDB
 */
export type Auth0ApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
