import { Record, Static, String } from 'runtypes';
import { EventbridgePutEvent } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpdateParticipantRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpdateParticipantRequestDto = Record({
  participantIdSourceValue: String,
});

export type UpdateParticipantRequestDto = Static<
  typeof UpdateParticipantRequestDto
>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateParticipantPutEvent =
  EventbridgePutEvent<UpdateParticipantRequestDto>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type UpdateParticipantEvent = UpdateParticipantPutEvent;

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
export function locateDto(incomingEvent: UpdateParticipantDtoOrEvent): unknown {
  if ('participantIdSourceValue' in incomingEvent) {
    return incomingEvent;
  }
  return incomingEvent.detail;
}
