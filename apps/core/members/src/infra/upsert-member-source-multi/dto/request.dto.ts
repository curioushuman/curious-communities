import { Record, Static } from 'runtypes';

import { MemberResponseDto } from '@curioushuman/cc-members-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isResponsePayload,
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
 * The data could be handed to us as the above DTO, OR a response payload
 */
export type UpsertMemberSourceMultiRequestPayload =
  CoAwsRequestPayload<MemberResponseDto>;

/**
 * A type to manage the two types of input we support
 */
export type UpsertMemberSourceMultiRequestDtoOrPayload =
  | UpsertMemberSourceMultiRequestDto
  | UpsertMemberSourceMultiRequestPayload;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpsertMemberSourceMultiPutEvent =
  EventbridgePutEvent<UpsertMemberSourceMultiRequestDtoOrPayload>;

/**
 * A lambda destination wrapped in an event
 */
export type UpsertMemberSourceMultiAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpsertMemberSourceMultiRequestDtoOrPayload>;

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
  | UpsertMemberSourceMultiRequestDtoOrPayload
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
  if (
    'member' in incomingEvent ||
    isResponsePayload<MemberResponseDto>(incomingEvent)
  ) {
    return prepareDtoFromPayload(incomingEvent);
  }
  if ('responsePayload' in incomingEvent.detail) {
    return prepareDtoFromPayload(incomingEvent.detail.responsePayload);
  }
  return prepareDtoFromPayload(incomingEvent.detail);
}

export function prepareDtoFromPayload(
  incomingEvent: UpsertMemberSourceMultiRequestDtoOrPayload
): UpsertMemberSourceMultiRequestDto {
  if (isResponsePayload<MemberResponseDto>(incomingEvent)) {
    return {
      member: incomingEvent.detail,
    };
  }
  return incomingEvent;
}
