import { Record, Static } from 'runtypes';
import {
  CourseBaseResponseDto,
  ParticipantSourceResponseDto,
} from '@curioushuman/cc-courses-service';
import { MemberResponseDto } from '@curioushuman/cc-members-service';
import {
  CoAwsRequestPayload,
  SfnTaskResponsePayload,
} from '@curioushuman/common';

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
 * NOTE: member might be a MemberResponseDto or a CoAwsRequestPayload<MemberResponseDto>
 *       as it could be either found, or created (within step function)
 */
interface CreateParticipantAsSfnResult {
  participantSource:
    | SfnTaskResponsePayload<ParticipantSourceResponseDto>
    | ParticipantSourceResponseDto;
  course: SfnTaskResponsePayload<CourseBaseResponseDto> | CourseBaseResponseDto;
  member: SfnTaskResponsePayload<
    MemberResponseDto | CoAwsRequestPayload<MemberResponseDto>
  >;
}

/**
 * CreateParticipantAsSfnResult predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isCreateParticipantAsSfnResult(
  event: unknown
): event is CreateParticipantAsSfnResult {
  return (
    'detail' in (event as CreateParticipantAsSfnResult).participantSource ||
    'detail' in (event as CreateParticipantAsSfnResult).course ||
    'detail' in (event as CreateParticipantAsSfnResult).member
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
export function locateDto(
  incomingEvent: CreateParticipantDtoOrEvent
): CreateParticipantRequestDto {
  if (isCreateParticipantAsSfnResult(incomingEvent)) {
    // member might be a MemberResponseDto or a CoAwsRequestPayload<MemberResponseDto>
    // as it could be either found, or created
    const member =
      'detail' in incomingEvent.member.detail
        ? incomingEvent.member.detail.detail
        : incomingEvent.member.detail;
    const participantSource =
      'detail' in incomingEvent.participantSource
        ? incomingEvent.participantSource.detail
        : incomingEvent.participantSource;
    const course =
      'detail' in incomingEvent.course
        ? incomingEvent.course.detail
        : incomingEvent.course;
    return {
      participantSource,
      course,
      member,
    };
  }
  return incomingEvent;
}
