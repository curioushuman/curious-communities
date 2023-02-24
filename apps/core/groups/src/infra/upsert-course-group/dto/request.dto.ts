import { Record, Static } from 'runtypes';
import { CourseDto } from '@curioushuman/cc-groups-service';
import {
  CoAwsRequestPayload,
  EventBridgeAsLambdaDestinationEvent,
  EventbridgePutEvent,
  isLambdaDestinationEvent,
  isResponsePayload,
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
 * The data could be handed to us as the above DTO, OR a response payload
 */
export type UpsertCourseGroupRequestPayload = CoAwsRequestPayload<CourseDto>;

/**
 * A type to manage the two types of input we support
 */
export type UpsertCourseGroupRequestDtoOrPayload =
  | UpsertCourseGroupRequestDto
  | UpsertCourseGroupRequestPayload;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpsertCourseGroupPutEvent =
  EventbridgePutEvent<UpsertCourseGroupRequestDtoOrPayload>;

/**
 * A lambda destination wrapped in an event
 */
export type UpsertCourseGroupAsDestinationEvent =
  EventBridgeAsLambdaDestinationEvent<UpsertCourseGroupRequestDtoOrPayload>;

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
  | UpsertCourseGroupRequestDtoOrPayload
  | UpsertCourseGroupEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpsertCourseGroupDtoOrEvent): unknown {
  if (
    'course' in incomingEvent ||
    isResponsePayload<CourseDto>(incomingEvent)
  ) {
    return prepareDtoFromPayload(incomingEvent);
  }
  if ('responsePayload' in incomingEvent.detail) {
    return prepareDtoFromPayload(incomingEvent.detail.responsePayload);
  }
  return prepareDtoFromPayload(incomingEvent.detail);
}

export function prepareDtoFromPayload(
  incomingEvent: UpsertCourseGroupRequestDtoOrPayload
): UpsertCourseGroupRequestDto {
  if (isResponsePayload<CourseDto>(incomingEvent)) {
    return {
      course: incomingEvent.detail,
    };
  }
  return incomingEvent;
}
