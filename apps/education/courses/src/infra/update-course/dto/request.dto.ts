import { Record, Static } from 'runtypes';
import { CourseBaseResponseDto } from '@curioushuman/cc-courses-service';
import {
  CoAwsRequestPayload,
  EventbridgePutEvent,
  isResponsePayload,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpdateCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpdateCourseRequestDto = Record({
  course: CourseBaseResponseDto,
});

export type UpdateCourseRequestDto = Static<typeof UpdateCourseRequestDto>;

/**
 * The data could be handed to us as the above DTO, OR a response payload
 */
export type UpdateCourseRequestPayload =
  CoAwsRequestPayload<CourseBaseResponseDto>;

/**
 * A type to manage the two types of input we support
 */
export type UpdateCourseRequestDtoOrPayload =
  | UpdateCourseRequestDto
  | UpdateCourseRequestPayload;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateCoursePutEvent =
  EventbridgePutEvent<UpdateCourseRequestDtoOrPayload>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateCourseSqsEvent =
  SqsAsEventSourceEvent<UpdateCourseRequestDtoOrPayload>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type UpdateCourseEvent = UpdateCoursePutEvent | UpdateCourseSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpdateCourseDtoOrEvent =
  | UpdateCourseRequestDtoOrPayload
  | UpdateCourseEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpdateCourseDtoOrEvent): unknown {
  if (
    'course' in incomingEvent ||
    isResponsePayload<CourseBaseResponseDto>(incomingEvent)
  ) {
    return prepareDtoFromPayload(incomingEvent);
  }
  if ('Records' in incomingEvent) {
    return prepareDtoFromPayload(incomingEvent.Records[0].body);
  }
  return prepareDtoFromPayload(incomingEvent.detail);
}

export function prepareDtoFromPayload(
  incomingEvent: UpdateCourseRequestDtoOrPayload
): UpdateCourseRequestDto {
  if (isResponsePayload<CourseBaseResponseDto>(incomingEvent)) {
    return {
      course: incomingEvent.detail,
    };
  }
  return incomingEvent;
}
