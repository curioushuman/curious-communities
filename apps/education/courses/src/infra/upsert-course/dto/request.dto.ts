import { Record, Static, String } from 'runtypes';
import {
  EventbridgePutEvent,
  SqsAsEventSourceEvent,
} from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the UpsertCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const UpsertCourseRequestDto = Record({
  idSourceValue: String,
});

export type UpsertCourseRequestDto = Static<typeof UpsertCourseRequestDto>;

/**
 * This is the shape of the DTO coming in from an external event
 */
export type ExternalCourseEventDto = {
  courseIdSourceValue: string;
};
/**
 * External events will be passed to us via EventBridge
 */
export type ExternalCoursePutEvent =
  EventbridgePutEvent<ExternalCourseEventDto>;

/**
 * What the input looks like when SQS is event source
 */
export type UpsertCourseSqsEvent =
  SqsAsEventSourceEvent<UpsertCourseRequestDto>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type UpsertCourseEvent = ExternalCoursePutEvent | UpsertCourseSqsEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type UpsertCourseDtoOrEvent = UpsertCourseRequestDto | UpsertCourseEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: UpsertCourseDtoOrEvent
): UpsertCourseRequestDto {
  if ('idSourceValue' in incomingEvent) {
    return incomingEvent;
  }
  if ('Records' in incomingEvent) {
    return incomingEvent.Records[0].body;
  }
  return {
    idSourceValue: incomingEvent.detail.courseIdSourceValue,
  };
}
