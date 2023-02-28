import { Record, Static } from 'runtypes';
import {
  CourseBaseResponseDto,
  ParticipantSourceResponseDto,
} from '@curioushuman/cc-courses-service';
import { MemberResponseDto } from '@curioushuman/cc-members-service';
import { SfnTaskResponsePayload } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * It is being called as part of a state machine, and will have quite a specific payload.
 *
 * We're going to add the event handling just in case... and for consistency
 */
export const CreateParticipantRequestDto = Record({
  participantSource: ParticipantSourceResponseDto,
  course: CourseBaseResponseDto,
  member: MemberResponseDto,
});

export type CreateParticipantRequestDto = Static<
  typeof CreateParticipantRequestDto
>;

/**
 * Once the step function task is complete, this is what the structure will look like
 */
interface CreateParticipantAsSfnResult {
  participantSource: SfnTaskResponsePayload<ParticipantSourceResponseDto>;
  course: SfnTaskResponsePayload<CourseBaseResponseDto>;
  member: SfnTaskResponsePayload<MemberResponseDto>;
}

/**
 * CreateParticipantAsSfnResult predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isCreateParticipantAsSfnResult(
  event: unknown
): event is CreateParticipantAsSfnResult {
  return (
    (event as CreateParticipantAsSfnResult).participantSource.detail !==
      undefined &&
    (event as CreateParticipantAsSfnResult).course.detail !== undefined &&
    (event as CreateParticipantAsSfnResult).member.detail !== undefined
  );
}

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type CreateParticipantDtoOrEvent =
  | CreateParticipantRequestDto
  | CreateParticipantAsSfnResult;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: CreateParticipantDtoOrEvent): unknown {
  if (isCreateParticipantAsSfnResult(incomingEvent)) {
    return {
      participantSource: incomingEvent.participantSource.detail,
      course: incomingEvent.course.detail,
      member: incomingEvent.member.detail,
    };
  }
  return incomingEvent;
}
