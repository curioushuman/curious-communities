import { Record, Static } from 'runtypes';
import { CourseDto } from '@curioushuman/cc-groups-service';
import {
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isLambdaDestinationEvent,
} from '@curioushuman/common';

/**
 * I am going to import the course DTO here
 * NOTE: from groups service, so we only include what is req'd by groups
 */

export const UpsertCourseGroupRequestDto = Record({
  course: CourseDto,
});

export type UpsertCourseGroupRequestDto = Static<
  typeof UpsertCourseGroupRequestDto
>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpsertCourseGroupPutEvent =
  EventbridgePutEvent<UpsertCourseGroupRequestDto>;

/**
 * A lambda destination wrapped in an event
 */
export type UpsertCourseGroupAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<CourseDto>;

/**
 * The two types of event we support
 */
export type UpsertCourseGroupEvent =
  | UpsertCourseGroupPutEvent
  | UpsertCourseGroupAsDestinationEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertCourseGroupDtoOrEvent =
  | UpsertCourseGroupRequestDto
  | UpsertCourseGroupEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpsertCourseGroupDtoOrEvent): unknown {
  if ('course' in incomingEvent) {
    return incomingEvent;
  }
  if (isLambdaDestinationEvent(incomingEvent)) {
    return incomingEvent.detail.responsePayload === null
      ? null
      : { member: incomingEvent.detail.responsePayload };
  }
  return incomingEvent.detail;
}
