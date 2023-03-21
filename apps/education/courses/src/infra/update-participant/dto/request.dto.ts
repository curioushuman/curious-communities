import { Optional, Record, Static, String } from 'runtypes';
import {
  EventbridgePutEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';
import {
  guardParticipantResponseDto,
  ParticipantResponseDto,
} from '@curioushuman/cc-courses-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpdateParticipantRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpdateParticipantRequestDto = Record({
  idSourceValue: Optional(String),
  participant: Optional(ParticipantResponseDto),
}).withConstraint((dto) => !!(dto.idSourceValue || dto.participant));

export type UpdateParticipantRequestDto = Static<
  typeof UpdateParticipantRequestDto
>;

/**
 * An alternative parser, instead of UpdateParticipantRequestDto.check()
 *
 * Runtypes can't deal with Records with too many layers i.e. participantResponseDto
 */
export const guardUpdateParticipantRequestDto = (
  dto: UpdateParticipantRequestDto
): boolean => {
  const { participant, idSourceValue } = dto;

  if (!participant && !idSourceValue) {
    return false;
  }
  if (participant) {
    return guardParticipantResponseDto(participant);
  }
  return true;
};

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateParticipantPutEvent =
  EventbridgePutEvent<UpdateParticipantRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateParticipantSqsEvent =
  SqsAsEventSourceEvent<UpdateParticipantRequestDto>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type UpdateParticipantEvent =
  | UpdateParticipantPutEvent
  | UpdateParticipantSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateParticipantDtoOrEvent =
  | UpdateParticipantRequestDto
  | UpdateParticipantEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpdateParticipantDtoOrEvent
): UpdateParticipantRequestDto {
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  if ('detail' in incomingEvent) {
    return incomingEvent.detail;
  }
  return incomingEvent;
}
