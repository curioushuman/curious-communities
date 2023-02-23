import {
  CoAwsResponseEvent,
  CoAwsResponseOutcome,
  CoAwsResponsePayload,
} from '@curioushuman/common';
import {
  CourseBaseResponseDto,
  CourseResponseDto,
} from './course.response.dto';
import { ParticipantSourceResponseDto } from './participant-source.response.dto';
import {
  ParticipantBaseResponseDto,
  ParticipantResponseDto,
} from './participant.response.dto';

/**
 * These are the responses currently supported by the API
 */
interface ResponsePayloadEntityDetailMap {
  /** course */
  course: CourseResponseDto;
  'course-base': CourseBaseResponseDto;
  /** course source */
  // 'course-source': CourseSourceResponseDto;

  /** participant */
  participant: ParticipantResponseDto;
  'participant-base': ParticipantBaseResponseDto;
  /** participant source */
  'participant-source': ParticipantSourceResponseDto;
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
  (entityDetail) => ({
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
