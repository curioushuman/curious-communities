import { Record, Static, String } from 'runtypes';

import { MemberResponseDto } from '@curioushuman/cc-members-service';
import { SqsAsEventSourceEvent } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: this function will only ever be called as a response to a create/update of member
 * in which case the full member object will be passed as part of the event, in the form of
 * a response DTO.
 */
export const UpsertMemberSourceRequestDto = Record({
  source: String,
  member: MemberResponseDto,
});

export type UpsertMemberSourceRequestDto = Static<
  typeof UpsertMemberSourceRequestDto
>;

/**
 * What the input looks like when SQS is event source
 */
export type UpsertMemberSourceSqsEvent =
  SqsAsEventSourceEvent<UpsertMemberSourceRequestDto>;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertMemberSourceDtoOrEvent =
  | UpsertMemberSourceRequestDto
  | UpsertMemberSourceSqsEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertMemberSourceDtoOrEvent
): unknown {
  if ('member' in incomingEvent) {
    return incomingEvent;
  }
  return incomingEvent.Records[0].body;
}
