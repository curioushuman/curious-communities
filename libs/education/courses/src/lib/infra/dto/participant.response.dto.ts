import { Array, Record, Static, String } from 'runtypes';
import { CourseBaseResponseDto } from './course.response.dto';

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export const ParticipantBaseResponseDto = Record({
  id: String,
  memberId: String,
  courseId: String,
  status: String,
  sourceIds: Array(String),
  name: String,
  email: String,
  organisationName: String,
  accountOwner: String,
});

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export type ParticipantBaseResponseDto = Static<
  typeof ParticipantBaseResponseDto
>;

/**
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * i.e. fields + relationships
 */

export const ParticipantResponseDto = ParticipantBaseResponseDto.extend({
  course: CourseBaseResponseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type ParticipantResponseDto = Static<typeof ParticipantResponseDto>;
