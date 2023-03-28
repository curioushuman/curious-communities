import { Record, Static, String } from 'runtypes';

import { MemberResponseDto } from '@curioushuman/cc-members-service';
import { SfnTaskInputTextReplica } from '@curioushuman/common';

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
 * A representation of the input structure we create during Sfn task definition
 */
interface UpsertMemberSourceAsSfnResult {
  source: SfnTaskInputTextReplica;
  member: MemberResponseDto;
}

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertMemberSourceDtoOrEvent =
  | UpsertMemberSourceRequestDto
  | UpsertMemberSourceAsSfnResult;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertMemberSourceDtoOrEvent
): UpsertMemberSourceRequestDto {
  if (typeof incomingEvent.source === 'object') {
    return {
      source: incomingEvent.source.value,
      member: incomingEvent.member,
    };
  }
  return incomingEvent as UpsertMemberSourceRequestDto;
}
