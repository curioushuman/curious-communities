import { Record, Static } from 'runtypes';
import { CourseBaseResponseDto } from '../../dto/course.response.dto';
import { MemberDto } from '../../dto/member.dto';
import { ParticipantSourceResponseDto } from '../../dto/participant-source.response.dto';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: for course and participant we use this microservice's own response DTOs
 * as it is know, and will always be known, by this application that is what is
 * sent and therefore received.
 *
 * For member, to keep coupling low, we only define what we need in this context.
 * Hence why it get's it own DTO.
 */
export const CreateParticipantRequestDto = Record({
  participantSource: ParticipantSourceResponseDto,
  course: CourseBaseResponseDto,
  member: MemberDto,
});

/**
 * This is the form of data we expect as input into our application
 */
export type CreateParticipantRequestDto = Static<
  typeof CreateParticipantRequestDto
>;
