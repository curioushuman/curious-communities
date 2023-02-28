import { Optional, Record, Static, String } from 'runtypes';
import {
  prepareExternalIdSourceValue,
  SfnTaskResponsePayload,
} from '@curioushuman/common';
import { ParticipantSourceResponseDto } from '@curioushuman/cc-courses-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindCourseRequestDto = Record({
  courseId: Optional(String),
  courseIdSourceValue: Optional(String),
}).withConstraint((dto) => !!(dto.courseId || dto.courseIdSourceValue));

/**
 * DTO that accepts any of the identifiers
 */
export type FindCourseRequestDto = Static<typeof FindCourseRequestDto>;

/**
 * Once the step function task is complete, this is what the structure will look like
 */
interface FindCourseAsSfnResult {
  participantSource: SfnTaskResponsePayload<ParticipantSourceResponseDto>;
}

/**
 * The two types of input we support
 * Straight up DTO or an event
 */
export type FindCourseDtoOrEvent = FindCourseRequestDto | FindCourseAsSfnResult;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(incomingEvent: FindCourseDtoOrEvent): unknown {
  if ('participantSource' in incomingEvent) {
    const courseIdSourceValue = prepareExternalIdSourceValue(
      incomingEvent.participantSource.detail.courseId,
      incomingEvent.participantSource.detail.source
    );
    return { courseIdSourceValue };
  }
  if ('detail' in incomingEvent) {
    return incomingEvent.detail;
  }
  return incomingEvent;
}
