import { Record, Static } from 'runtypes';
import { SqsAsEventSourceEvent } from '@curioushuman/common';
import { ParticipantSourceResponseDto } from '@curioushuman/cc-courses-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpsertParticipantRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpsertParticipantRequestDto = Record({
  participantSource: ParticipantSourceResponseDto,
});

export type UpsertParticipantRequestDto = Static<
  typeof UpsertParticipantRequestDto
>;

/**
 * What the input looks like when SQS is event source
 */
export type UpsertParticipantSqsEvent =
  SqsAsEventSourceEvent<UpsertParticipantRequestDto>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type UpsertParticipantEvent = UpsertParticipantSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertParticipantDtoOrEvent =
  | UpsertParticipantRequestDto
  | UpsertParticipantEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertParticipantDtoOrEvent
): UpsertParticipantRequestDto {
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  return incomingEvent;
}
