import { Record, Static, String } from 'runtypes';

import { GroupBaseResponseDto } from '@curioushuman/cc-groups-service';
import { SfnTaskInputTextReplica } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * It is being called as part of a state machine so... should be straight to DTO but...
 */
export const UpsertGroupSourceRequestDto = Record({
  source: String,
  group: GroupBaseResponseDto,
});

export type UpsertGroupSourceRequestDto = Static<
  typeof UpsertGroupSourceRequestDto
>;

/**
 * A representation of the input structure we create during Sfn task definition
 */
interface UpsertGroupSourceAsSfnResult {
  source: SfnTaskInputTextReplica;
  group: GroupBaseResponseDto;
}

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertGroupSourceDtoOrEvent =
  | UpsertGroupSourceRequestDto
  | UpsertGroupSourceAsSfnResult;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertGroupSourceDtoOrEvent
): UpsertGroupSourceRequestDto {
  if (typeof incomingEvent.source === 'object') {
    return {
      source: incomingEvent.source.value,
      group: incomingEvent.group,
    };
  }
  return incomingEvent as UpsertGroupSourceRequestDto;
}
