import { Record, Static, String } from 'runtypes';
import { EventbridgePutEvent } from '@curioushuman/common';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the CreateCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const CreateCourseRequestDto = Record({
  courseIdSourceValue: String,
});

export type CreateCourseRequestDto = Static<typeof CreateCourseRequestDto>;

/**
 * What the input would look like if someone 'put's it to an eventBus
 */
export type CreateCoursePutEvent = EventbridgePutEvent<CreateCourseRequestDto>;

/**
 * The types of event we support
 *
 * This allows us space to add additional event types
 */
export type CreateCourseEvent = CreateCoursePutEvent;

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type CreateCourseDtoOrEvent = CreateCourseRequestDto | CreateCourseEvent;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: CreateCourseDtoOrEvent): unknown {
  if ('courseIdSourceValue' in incomingEvent) {
    return incomingEvent;
  }
  return incomingEvent.detail;
}
