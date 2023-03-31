import { Record, Static, String } from 'runtypes';

import {
  EventBridgeAsLambdaDestinationEvent,
  SfnTaskInputTextReplica,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';
import { GroupMemberBaseResponseDto } from '@curioushuman/cc-groups-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: this function will only ever be called as a response to a create/update of member
 * in which case the full member object will be passed as part of the event, in the form of
 * a response DTO.
 */
export const UpsertGroupMemberSourceRequestDto = Record({
  source: String,
  groupMember: GroupMemberBaseResponseDto,
});

export type UpsertGroupMemberSourceRequestDto = Static<
  typeof UpsertGroupMemberSourceRequestDto
>;

/**
 * An alternative parser, instead of UpsertGroupMemberSourceRequestDto.check()
 *
 * Runtypes can't deal with Records with too many layers i.e. groupMemberResponseDto
 */
export const guardUpsertGroupMemberSourceRequestDto = (
  dto: UpsertGroupMemberSourceRequestDto
): boolean => {
  const { groupMember } = dto;

  return GroupMemberBaseResponseDto.guard(groupMember);
};

/**
 * A representation of the input structure we create during Sfn task definition
 */
interface UpsertGroupMemberSourceAsSfnResult {
  source: SfnTaskInputTextReplica;
  groupMember: GroupMemberBaseResponseDto;
}

/**
 * What the input looks like when lambda is subscribed as a destination
 */
export type UpsertGroupMemberSourceAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpsertGroupMemberSourceRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpsertGroupMemberSourceSqsEvent =
  SqsAsEventSourceEvent<UpsertGroupMemberSourceRequestDto>;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertGroupMemberSourceDtoOrEvent =
  | UpsertGroupMemberSourceRequestDto
  | UpsertGroupMemberSourceAsSfnResult
  | UpsertGroupMemberSourceAsDestinationEvent
  | UpsertGroupMemberSourceSqsEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertGroupMemberSourceDtoOrEvent
): UpsertGroupMemberSourceRequestDto {
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  if ('detail' in incomingEvent) {
    return incomingEvent.detail.responsePayload;
  }
  if (typeof incomingEvent.source === 'object') {
    return {
      source: incomingEvent.source.value,
      groupMember: incomingEvent.groupMember,
    };
  }
  return incomingEvent as UpsertGroupMemberSourceRequestDto;
}
