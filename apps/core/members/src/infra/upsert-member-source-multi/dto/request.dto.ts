import { Record, Static } from 'runtypes';

import { MemberResponseDto } from '@curioushuman/cc-members-service';
import {
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isLambdaDestinationEvent,
} from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: this function will only ever be called as a response to a create/update of member
 * in which case the full member object will be passed as part of the event, in the form of
 * a response DTO.
 */
export const UpsertMemberSourceMultiRequestDto = Record({
  member: MemberResponseDto,
});

export type UpsertMemberSourceMultiRequestDto = Static<
  typeof UpsertMemberSourceMultiRequestDto
>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpsertMemberSourceMultiPutEvent =
  EventbridgePutEvent<UpsertMemberSourceMultiRequestDto>;

/**
 * A lambda destination wrapped in an event
 */
export type UpsertMemberSourceMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<MemberResponseDto>;

/**
 * The two types of event we support
 */
export type UpsertMemberSourceMultiEvent =
  | UpsertMemberSourceMultiPutEvent
  | UpsertMemberSourceMultiAsDestinationEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertMemberSourceMultiDtoOrEvent =
  | UpsertMemberSourceMultiRequestDto
  | UpsertMemberSourceMultiEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertMemberSourceMultiDtoOrEvent
): unknown {
  if ('member' in incomingEvent) {
    return incomingEvent;
  }
  if (isLambdaDestinationEvent(incomingEvent)) {
    return incomingEvent.detail.responsePayload === null
      ? null
      : { member: incomingEvent.detail.responsePayload };
  }
  return incomingEvent.detail;
}
