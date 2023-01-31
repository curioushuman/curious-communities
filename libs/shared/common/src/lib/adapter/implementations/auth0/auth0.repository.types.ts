import { RunTypeReplica } from '../common/repository.types';

/**
 * Props for SF repo
 */
export interface Auth0ApiRepositoryProps {
  sourceName: string;
  responseRuntype: RunTypeReplica;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type Auth0ApiFindOneProcessMethod<DomainT, ResponseT> = (
  item?: ResponseT,
  uri?: string
) => DomainT;
