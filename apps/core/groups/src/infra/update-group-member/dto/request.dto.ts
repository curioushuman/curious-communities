import { Record, Static } from 'runtypes';
import {
  GroupMemberResponseDto,
  guardGroupMemberResponseDto,
} from '@curioushuman/cc-groups-service';
import {
  CoAwsRequestPayload,
  EventbridgePutEvent,
  isResponsePayload,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

export const UpdateGroupMemberRequestDto = Record({
  groupMember: GroupMemberResponseDto,
});

export type UpdateGroupMemberRequestDto = Static<
  typeof UpdateGroupMemberRequestDto
>;

/**
 * An alternative parser, instead of UpdateGroupMemberRequestDto.check()
 *
 * Runtypes can't deal with Records with too many layers i.e. groupMemberResponseDto
 */
export const guardUpdateGroupMemberRequestDto = (
  dto: UpdateGroupMemberRequestDto
): boolean => {
  const { groupMember } = dto;

  return guardGroupMemberResponseDto(groupMember);
};

/**
 * The data could be handed to us as the above DTO, OR a response payload
 */
export type UpdateGroupMemberRequestPayload =
  CoAwsRequestPayload<GroupMemberResponseDto>;

/**
 * A type to manage the two types of input we support
 */
export type UpdateGroupMemberRequestDtoOrPayload =
  | UpdateGroupMemberRequestDto
  | UpdateGroupMemberRequestPayload;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateGroupMemberPutEvent =
  EventbridgePutEvent<UpdateGroupMemberRequestDtoOrPayload>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateGroupMemberSqsEvent =
  SqsAsEventSourceEvent<UpdateGroupMemberRequestDtoOrPayload>;

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
  | UpdateGroupMemberRequestDtoOrPayload
  | UpdateGroupMemberEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpdateGroupMemberDtoOrEvent
): UpdateGroupMemberRequestDto {
  if (
    'groupMember' in incomingEvent ||
    isResponsePayload<GroupMemberResponseDto>(incomingEvent)
  ) {
    return prepareDtoFromPayload(incomingEvent);
  }
  if ('Records' in incomingEvent) {
    return prepareDtoFromPayload(incomingEvent.Records[0].body);
  }
  return prepareDtoFromPayload(incomingEvent.detail);
}

export function prepareDtoFromPayload(
  incomingEvent: UpdateGroupMemberRequestDtoOrPayload
): UpdateGroupMemberRequestDto {
  if (isResponsePayload<GroupMemberResponseDto>(incomingEvent)) {
    return {
      groupMember: incomingEvent.detail,
    };
  }
  return incomingEvent;
}
