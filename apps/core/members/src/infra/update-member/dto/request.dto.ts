import { Record, Static, String } from 'runtypes';
import {
  EventbridgePutEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpdateMemberRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpdateMemberRequestDto = Record({
  memberIdSourceValue: String,
});

export type UpdateMemberRequestDto = Static<typeof UpdateMemberRequestDto>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateMemberPutEvent = EventbridgePutEvent<UpdateMemberRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateMemberSqsEvent =
  SqsAsEventSourceEvent<UpdateMemberRequestDto>;

/**
 * The types of event we support
 */
export type UpdateMemberEvent = UpdateMemberPutEvent | UpdateMemberSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateMemberDtoOrEvent = UpdateMemberRequestDto | UpdateMemberEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpdateMemberDtoOrEvent): unknown {
  if ('memberIdSourceValue' in incomingEvent) {
    return incomingEvent;
  }
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  return incomingEvent.detail;
}
