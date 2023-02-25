import { Record, Static, String } from 'runtypes';

import { GroupBaseResponseDto } from '@curioushuman/cc-groups-service';
import {
  SfnTaskInputAsEventSource,
  SfnTaskInputTextReplica,
} from '@curioushuman/common';

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
interface UpsertGroupSourceAsSfnTaskInput {
  source: SfnTaskInputTextReplica;
  group: GroupBaseResponseDto;
}

/**
 * What the input looks like when called from step functions
 */
export type UpsertGroupSourceAsSfnTask =
  SfnTaskInputAsEventSource<UpsertGroupSourceAsSfnTaskInput>;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertGroupSourceDtoOrEvent =
  | UpsertGroupSourceRequestDto
  | UpsertGroupSourceAsSfnTask;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpsertGroupSourceDtoOrEvent): unknown {
  if ('group' in incomingEvent) {
    return incomingEvent;
  }
  return {
    source: incomingEvent.input.source.value,
    group: incomingEvent.input.group,
  };
}
