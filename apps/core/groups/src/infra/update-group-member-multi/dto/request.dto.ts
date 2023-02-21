import { Record, Static } from 'runtypes';
import { GroupBaseResponseDto } from '@curioushuman/cc-groups-service';
import {
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isLambdaDestinationEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * I am going to import the course DTO here
 * NOTE: from groups service, so we only include what is req'd by groups
 */

export const UpdateGroupMemberMultiRequestDto = Record({
  group: GroupBaseResponseDto,
});

export type UpdateGroupMemberMultiRequestDto = Static<
  typeof UpdateGroupMemberMultiRequestDto
>;

/**
 * What the input looks like when lambda is subscribed as a destination
 */
export type UpdateGroupMemberMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpdateGroupMemberMultiRequestDto>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateGroupMemberMultiPutEvent =
  EventbridgePutEvent<UpdateGroupMemberMultiRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateGroupMemberMultiSqsEvent =
  SqsAsEventSourceEvent<UpdateGroupMemberMultiRequestDto>;

/**
 * The types of event we support
 */
export type UpdateGroupMemberMultiEvent =
  | UpdateGroupMemberMultiAsDestinationEvent
  | UpdateGroupMemberMultiPutEvent
  | UpdateGroupMemberMultiSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateGroupMemberMultiDtoOrEvent =
  | UpdateGroupMemberMultiRequestDto
  | UpdateGroupMemberMultiEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpdateGroupMemberMultiDtoOrEvent
): unknown {
  if ('group' in incomingEvent) {
    return incomingEvent;
  }
  if (isLambdaDestinationEvent(incomingEvent)) {
    return incomingEvent.detail.responsePayload;
  }
  return 'Records' in incomingEvent
    ? incomingEvent.Records[0].body
    : incomingEvent.detail;
}
