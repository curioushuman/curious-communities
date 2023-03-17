import { Optional, Record, Static, String } from 'runtypes';
import {
  EventbridgePutEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';
import { CourseResponseDto } from '@curioushuman/cc-courses-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpdateCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpdateCourseRequestDto = Record({
  courseIdSourceValue: Optional(String),
  course: Optional(CourseResponseDto),
}).withConstraint((dto) => !!(dto.courseIdSourceValue || dto.course));

export type UpdateCourseRequestDto = Static<typeof UpdateCourseRequestDto>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type UpdateCoursePutEvent = EventbridgePutEvent<UpdateCourseRequestDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpdateCourseSqsEvent =
  SqsAsEventSourceEvent<UpdateCourseRequestDto>;

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
export type UpdateCourseDtoOrEvent = UpdateCourseRequestDto | UpdateCourseEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: UpdateCourseDtoOrEvent): unknown {
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  if ('detail' in incomingEvent) {
    return incomingEvent.detail;
  }
  return incomingEvent;
}
