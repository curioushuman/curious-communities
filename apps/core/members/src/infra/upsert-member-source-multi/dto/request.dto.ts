import { EventBridgeEvent } from 'aws-lambda';
import { Record, Static } from 'runtypes';

import { MemberResponseDto } from '@curioushuman/cc-members-service';

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
export type UpsertMemberSourceMultiPutEvent = EventBridgeEvent<
  'putEvent',
  UpsertMemberSourceMultiRequestDto
>;

/**
 * What the data looks like when eventBus used as a lambda destination
 *
 * Not ideal, but I couldn't find reference to a type to use here
 */
interface LambdaDestinationReplica {
  requestContext: unknown;
  requestPayload: unknown;
  responseContext: unknown;
  responsePayload: MemberResponseDto;
}

/**
 * A lambda destination wrapped in an event
 */
export type UpsertMemberSourceMultiAsDestinationEvent = EventBridgeEvent<
  'Lambda Function Invocation Result - Success',
  LambdaDestinationReplica
>;

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
 * Destination event predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
function isDestinationEvent(
  event: UpsertMemberSourceMultiEvent
): event is UpsertMemberSourceMultiAsDestinationEvent {
  return (
    (event as UpsertMemberSourceMultiAsDestinationEvent).detail
      .responsePayload !== undefined
  );
}

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 */
function locateDto(incomingEvent: UpsertMemberSourceMultiDtoOrEvent) {
  if ('member' in incomingEvent) {
    return incomingEvent;
  }
  if (isDestinationEvent(incomingEvent)) {
    return {
      member: incomingEvent.detail.responsePayload,
    };
  }
  return incomingEvent.detail;
}

/**
 * This will check the data is in the correct format
 */
export function parseDto(
  incomingEvent: UpsertMemberSourceMultiDtoOrEvent
): UpsertMemberSourceMultiRequestDto | undefined {
  return incomingEvent === undefined
    ? undefined
    : UpsertMemberSourceMultiRequestDto.check(locateDto(incomingEvent));
}
