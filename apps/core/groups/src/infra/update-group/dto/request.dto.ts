import { Record, Static } from 'runtypes';
import {
  GroupBaseResponseDto,
  GroupSourceResponseDto,
} from '@curioushuman/cc-groups-service';
import {
  EventbridgePutEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * It is being called as part of a state machine, and will have quite a specific payload.
 * {
 *  detail: {
 *   responsePayload: {
 *     group: {course-group that incited the step functions}
 *   }
 *  groupSources: {
 *   COMMUNITY: {groupSource for COMMUNITY},
 *   MICROCOURSE: {groupSource for MICROCOURSE},
 *  }
 * }
 *
 * Adding event handling just for consistency
 */
export const UpdateGroupRequestDto = Record({
  detail: Record({
    responsePayload: Record({
      group: GroupBaseResponseDto,
    }),
  }),
  groupSources: Record({
    COMMUNITY: GroupSourceResponseDto,
    MICROCOURSE: GroupSourceResponseDto,
  }),
});

export type UpdateGroupRequestDto = Static<typeof UpdateGroupRequestDto>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateGroupPutEvent = EventbridgePutEvent<UpdateGroupRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateGroupSqsEvent = SqsAsEventSourceEvent<UpdateGroupRequestDto>;

/**
 * The types of event we support
 */
export type UpdateGroupEvent = UpdateGroupPutEvent | UpdateGroupSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateGroupDtoOrEvent = UpdateGroupRequestDto | UpdateGroupEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpdateGroupDtoOrEvent): unknown {
  if ('groupSources' in incomingEvent) {
    return incomingEvent;
  }
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  return incomingEvent.detail;
}
