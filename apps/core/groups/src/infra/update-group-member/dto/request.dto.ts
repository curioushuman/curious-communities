import { Record, Static } from 'runtypes';
import { GroupMemberResponseDto } from '@curioushuman/cc-groups-service';
import {
  EventbridgePutEvent,
  isSqsEventSourceEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * I am going to import the course DTO here
 * NOTE: from groups service, so we only include what is req'd by groups
 */

export const UpdateGroupMemberRequestDto = Record({
  groupMember: GroupMemberResponseDto,
});

export type UpdateGroupMemberRequestDto = Static<
  typeof UpdateGroupMemberRequestDto
>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateGroupMemberPutEvent =
  EventbridgePutEvent<UpdateGroupMemberRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateGroupMemberSqsEvent =
  SqsAsEventSourceEvent<UpdateGroupMemberRequestDto>;

/**
 * The types of event we support
 */
export type UpdateGroupMemberEvent =
  | UpdateGroupMemberPutEvent
  | UpdateGroupMemberSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateGroupMemberDtoOrEvent =
  | UpdateGroupMemberRequestDto
  | UpdateGroupMemberEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpdateGroupMemberDtoOrEvent): unknown {
  if ('participant' in incomingEvent) {
    return incomingEvent;
  }
  if (isSqsEventSourceEvent(incomingEvent)) {
    return incomingEvent.Records[0].body;
  }
  // ? why do I still need to typecast?
  return (incomingEvent as UpdateGroupMemberPutEvent).detail;
}