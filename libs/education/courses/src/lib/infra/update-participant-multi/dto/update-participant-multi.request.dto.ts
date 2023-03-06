import { Optional, Record, Static } from 'runtypes';
import { ParticipantResponseDto } from '../../dto/participant.response.dto';
import { CourseBaseResponseDto } from '../../dto/course.response.dto';
import { MemberDto } from '../../dto/member.dto';

/**
 * Externally facing DTO for update multiple participants at a time
 */
export const UpdateParticipantMultiRequestDto = Record({
  participant: Optional(ParticipantResponseDto),
  course: Optional(CourseBaseResponseDto),
  member: Optional(MemberDto),
}).withConstraint((dto) => !!(dto.course || dto.member));

export type UpdateParticipantMultiRequestDto = Static<
  typeof UpdateParticipantMultiRequestDto
>;
