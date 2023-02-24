import { Record, Static } from 'runtypes';
import { GroupBaseResponseDto } from '@curioushuman/cc-groups-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isResponsePayload,
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
 * The data could be handed to us as the above DTO, OR a response payload
 */
export type UpdateGroupMemberMultiRequestPayload =
  CoAwsRequestPayload<GroupBaseResponseDto>;

/**
 * A type to manage the two types of input we support
 */
export type UpdateGroupMemberMultiRequestDtoOrPayload =
  | UpdateGroupMemberMultiRequestDto
  | UpdateGroupMemberMultiRequestPayload;

/**
 * What the input looks like when lambda is subscribed as a destination
 */
export type UpdateGroupMemberMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpdateGroupMemberMultiRequestDtoOrPayload>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateGroupMemberMultiPutEvent =
  EventbridgePutEvent<UpdateGroupMemberMultiRequestDtoOrPayload>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateGroupMemberMultiSqsEvent =
  SqsAsEventSourceEvent<UpdateGroupMemberMultiRequestDtoOrPayload>;

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
  | UpdateGroupMemberMultiRequestDtoOrPayload
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
  if (
    'group' in incomingEvent ||
    isResponsePayload<GroupBaseResponseDto>(incomingEvent)
  ) {
    return prepareDtoFromPayload(incomingEvent);
  }
  if ('Records' in incomingEvent) {
    return prepareDtoFromPayload(incomingEvent.Records[0].body);
  }
  if ('responsePayload' in incomingEvent.detail) {
    return prepareDtoFromPayload(incomingEvent.detail.responsePayload);
  }
  return prepareDtoFromPayload(incomingEvent.detail);
}

export function prepareDtoFromPayload(
  incomingEvent: UpdateGroupMemberMultiRequestDtoOrPayload
): UpdateGroupMemberMultiRequestDto {
  if (isResponsePayload<GroupBaseResponseDto>(incomingEvent)) {
    return {
      group: incomingEvent.detail,
    };
  }
  return incomingEvent;
}
