import { RunTypeReplica } from '../../__types__';

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

/**
 * Props for findAll
 */
export interface TribeApiFindAllProps {
  page?: number;
  limit?: number;
}
export type TribeApiFindAllPropsConfirmed = Required<TribeApiFindAllProps>;

/**
 * Response for findAll
 */
export type TribeApiFindAllResponse<SourceT> = SourceT[];

/**
 * Type contract for processing findAll results from Tribe API
 */
export type TribeApiFindAllProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;

/**
 * Type contract for processing saveOne results from Tribe API
 */
export type TribeApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
