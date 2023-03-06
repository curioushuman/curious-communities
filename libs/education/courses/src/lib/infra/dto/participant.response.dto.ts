import { Array, Record, Static, String } from 'runtypes';
import { CourseBaseResponseDto } from './course.response.dto';
import { MemberDto } from './member.dto';

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
  member: MemberDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type ParticipantResponseDto = Static<typeof ParticipantResponseDto>;

/**
 * An alternative parser, instead of ParticipantResponseDto.check()
 *
 * Participant being a Union and a Composite I think has proven too much
 */
export const parseParticipantResponseDto = (
  participantResponseDto: ParticipantResponseDto
): ParticipantResponseDto => {
  const { course, member, ...participantResponseDtoBase } =
    participantResponseDto;
  const parsedParticipantBaseResponseDto = ParticipantBaseResponseDto.check(
    participantResponseDtoBase
  );
  return {
    ...parsedParticipantBaseResponseDto,
    course: CourseBaseResponseDto.check(course),
    member: MemberDto.check(member),
  };
};
