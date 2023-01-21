import { Array, Number, Optional, Record, Static, String } from 'runtypes';
import { ParticipantBaseResponseDto } from './participant.response.dto';

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export const CourseBaseResponseDto = Record({
  id: String,
  slug: String,
  status: String,
  sourceIds: Array(String),
  supportType: String,
  name: String,
  dateOpen: Optional(Number),
  dateClosed: Optional(Number),
  yearMonthOpen: Optional(String),
  accountOwner: String,
});

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export type CourseBaseResponseDto = Static<typeof CourseBaseResponseDto>;

/**
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * i.e. fields + relationships
 */

export const CourseResponseDto = CourseBaseResponseDto.extend({
  participants: Array(ParticipantBaseResponseDto),
});

/**
 * DTO that accepts any of the identifiers
 */
export type CourseResponseDto = Static<typeof CourseResponseDto>;
