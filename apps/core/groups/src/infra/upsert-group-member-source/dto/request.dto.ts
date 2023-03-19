import { Record, Static, String } from 'runtypes';

import {
  EventBridgeAsLambdaDestinationEvent,
  isLambdaDestinationEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';
import { GroupMemberResponseDto } from '@curioushuman/cc-groups-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: this function will only ever be called as a response to a create/update of member
 * in which case the full member object will be passed as part of the event, in the form of
 * a response DTO.
 */
export const UpsertGroupMemberSourceRequestDto = Record({
  source: String,
  groupMember: GroupMemberResponseDto,
});

export type UpsertGroupMemberSourceRequestDto = Static<
  typeof UpsertGroupMemberSourceRequestDto
>;

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
  | UpsertGroupMemberSourceAsDestinationEvent
  | UpsertGroupMemberSourceRequestDto
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
  if ('groupMember' in incomingEvent) {
    return incomingEvent;
  }
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  if ('responsePayload' in incomingEvent.detail) {
    return incomingEvent.detail.responsePayload;
  }
  return incomingEvent.detail;
}
