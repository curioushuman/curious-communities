import { Optional, Record, Static, String } from 'runtypes';
import { ParticipantSourceResponseDto } from '@curioushuman/cc-courses-service';
import { SfnTaskResponsePayload } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindMemberRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindMemberRequestDto = Record({
  id: Optional(String),
  email: Optional(String),
  idSourceValue: Optional(String),
}).withConstraint((dto) => !!(dto.id || dto.email || dto.idSourceValue));

/**
 * DTO that accepts any of the identifiers
 */
export type FindMemberRequestDto = Static<typeof FindMemberRequestDto>;

/**
 * Once the step function task is complete, this is what the structure will look like
 */
interface FindMemberAsSfnResult {
  participantSource:
    | SfnTaskResponsePayload<ParticipantSourceResponseDto>
    | ParticipantSourceResponseDto;
}

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type FindMemberDtoOrEvent = FindMemberRequestDto | FindMemberAsSfnResult;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: FindMemberDtoOrEvent
): FindMemberRequestDto {
  if ('participantSource' in incomingEvent) {
    const participantSource =
      'detail' in incomingEvent.participantSource
        ? incomingEvent.participantSource.detail
        : incomingEvent.participantSource;
    return { email: participantSource.memberEmail };
  }
  return incomingEvent;
}
