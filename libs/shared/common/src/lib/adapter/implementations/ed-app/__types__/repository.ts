import { RunTypeReplica } from '../../__types__';

/**
 * Props for SF repo
 */
export interface EdAppApiRepositoryProps {
  sourceName: string;
  sourceRuntype: RunTypeReplica;
  parentSourceName?: string;
}

/**
 * Type contract for processing findOne results from DynamoDB
 */
export type EdAppApiFindOneProcessMethod<DomainT, SourceT> = (
  item?: SourceT,
  uri?: string
) => DomainT;

/**
 * Props for findAll
 */
export interface EdAppApiFindAllProps {
  page?: number;
  pagesize?: number;
}
export type EdAppApiFindAllPropsConfirmed = Required<EdAppApiFindAllProps>;

/**
 * Response for findAll
 */
export interface EdAppApiFindAllResponse<SourceT> {
  totalCount: number;
  items: SourceT[];
}

/**
 * Type contract for processing findAll results from Ed-App API
 */
export type EdAppApiFindAllProcessMethod<DomainT, SourceT> = (
  item?: SourceT
) => DomainT;

/**
 * Type contract for processing saveOne results from Ed-App API
 */
export type EdAppApiSaveOneProcessMethod<DomainT, SourceT> = (
  item: SourceT
) => DomainT;
