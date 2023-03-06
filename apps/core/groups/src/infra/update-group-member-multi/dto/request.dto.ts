import { Optional, Record, Static } from 'runtypes';
import {
  GroupBaseResponseDto,
  MemberDto,
} from '@curioushuman/cc-groups-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
} from '@curioushuman/common';

/**
 * I am going to import the course DTO here
 * NOTE: from groups service, so we only include what is req'd by groups
 */

export const UpdateGroupMemberMultiRequestDto = Record({
  group: Optional(GroupBaseResponseDto),
  member: Optional(MemberDto),
});

export type UpdateGroupMemberMultiRequestDto = Static<
  typeof UpdateGroupMemberMultiRequestDto
>;

/**
 * The data could be handed to us as the above DTO, OR a response payload (from another service)
 */
export type UpdateGroupMemberMultiGroupRequestPayload =
  CoAwsRequestPayload<GroupBaseResponseDto>;
export type UpdateGroupMemberMultiMemberRequestPayload =
  CoAwsRequestPayload<MemberDto>;
export type UpdateGroupMemberMultiRequestPayload =
  | UpdateGroupMemberMultiGroupRequestPayload
  | UpdateGroupMemberMultiMemberRequestPayload;

/**
 * Within the request, it could be a DTO or a payload
 */
export type UpdateGroupMemberMultiRequestDtoOrPayload =
  | UpdateGroupMemberMultiRequestDto
  | UpdateGroupMemberMultiRequestPayload;

/**
 * What the request looks like when lambda is subscribed as a destination
 */
export type UpdateGroupMemberMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpdateGroupMemberMultiRequestDtoOrPayload>;

/**
 * What the request would look like if someone 'put's it to an eventBus
 */
export type UpdateGroupMemberMultiPutEvent =
  EventbridgePutEvent<UpdateGroupMemberMultiRequestDtoOrPayload>;

/**
 * The types of event we support (as a single type)
 */
export type UpdateGroupMemberMultiEvent =
  | UpdateGroupMemberMultiAsDestinationEvent
  | UpdateGroupMemberMultiPutEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event with a payload or DTO
 */
export type UpdateGroupMemberMultiDtoOrEvent =
  | UpdateGroupMemberMultiRequestDto
  | UpdateGroupMemberMultiEvent;

function locateDtoOrPayload(
  incomingEvent: UpdateGroupMemberMultiEvent
): UpdateGroupMemberMultiRequestDtoOrPayload {
  if ('responsePayload' in incomingEvent.detail) {
    return incomingEvent.detail.responsePayload;
  }
  return incomingEvent.detail;
}

function prepareDto(
  dtoOrPayload: UpdateGroupMemberMultiRequestDtoOrPayload
): UpdateGroupMemberMultiRequestDto {
  if (!('detail' in dtoOrPayload)) {
    return dtoOrPayload;
  }
  if ('email' in dtoOrPayload.detail) {
    return {
      member: dtoOrPayload.detail,
    };
  }
  return {
    group: dtoOrPayload.detail,
  };
}

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpdateGroupMemberMultiDtoOrEvent
): UpdateGroupMemberMultiRequestDto {
  if ('detail' in incomingEvent) {
    return prepareDto(locateDtoOrPayload(incomingEvent));
  }
  return incomingEvent;
}
