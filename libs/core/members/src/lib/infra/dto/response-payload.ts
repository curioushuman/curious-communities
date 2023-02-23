import {
  CoAwsResponseEvent,
  CoAwsResponseOutcome,
  CoAwsResponsePayload,
} from '@curioushuman/common';
import { MemberSourceResponseDto } from './member-source.response.dto';
import { MemberResponseDto } from './member.response.dto';

/**
 * These are the responses currently supported by the API
 */
interface ResponsePayloadEntityDetailMap {
  /** group member */
  member: MemberResponseDto;
  /** group member source */
  'member-source': MemberSourceResponseDto;
}

export type ResponsePayloadEntityName = keyof ResponsePayloadEntityDetailMap;

/**
 * Builds upon the base response payload, but constrained for this context
 */
export type ResponsePayload<N extends ResponsePayloadEntityName> =
  CoAwsResponsePayload<N, ResponsePayloadEntityDetailMap[N]>;

/**
 * Helper function to prepare the payload
 */
export const prepareResponsePayload =
  <N extends ResponsePayloadEntityName>(
    entityName: N,
    event: CoAwsResponseEvent,
    outcome: CoAwsResponseOutcome
  ): ((
    entityDetail: ResponsePayloadEntityDetailMap[N]
  ) => ResponsePayload<N>) =>
  (entityDetail: ResponsePayloadEntityDetailMap[N]) => ({
    event,
    outcome,
    entity: entityName,
    detail: entityDetail,
  });

/**
 * Convenience function to prepare the payload during upsert events
 */
export const prepareUpsertResponsePayload =
  <N extends ResponsePayloadEntityName>(
    entityName: N,
    updated = false,
    noChange = false
  ): ((
    entityDetail: ResponsePayloadEntityDetailMap[N]
  ) => ResponsePayload<N>) =>
  (entityDetail: ResponsePayloadEntityDetailMap[N]) => ({
    event: updated ? 'updated' : 'created',
    outcome: noChange ? 'no-change' : 'success',
    entity: entityName,
    detail: entityDetail,
  });

/**
 * Convenience function to prepare the payload during delete events
 */
export const prepareDeleteResponsePayload =
  <N extends ResponsePayloadEntityName>(
    entityName: N,
    noChange = false
  ): ((
    entityDetail: ResponsePayloadEntityDetailMap[N]
  ) => ResponsePayload<N>) =>
  (entityDetail: ResponsePayloadEntityDetailMap[N]) => ({
    event: 'deleted',
    outcome: noChange ? 'no-change' : 'success',
    entity: entityName,
    detail: entityDetail,
  });
