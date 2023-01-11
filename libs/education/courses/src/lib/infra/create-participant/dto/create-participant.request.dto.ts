import { Record, Static } from 'runtypes';
import { CourseDto } from '../../dto/course.dto';
import { MemberDto } from '../../dto/member.dto';
import { ParticipantSourceDto } from '../../dto/participant-source.dto';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

export const CreateParticipantRequestDto = Record({
  participantSource: ParticipantSourceDto,
  course: CourseDto,
  member: MemberDto,
});

export type CreateParticipantRequestDto = Static<
  typeof CreateParticipantRequestDto
>;
