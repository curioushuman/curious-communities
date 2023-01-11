import { Record, Static } from 'runtypes';

import { MemberDto } from '../../../infra/dto/member.dto';
import { ParticipantSourceDto } from '../../../infra/dto/participant-source.dto';
import { CourseDto } from '../../../infra/dto/course.dto';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateParticipantDto = Record({
  participantSource: ParticipantSourceDto,
  course: CourseDto,
  member: MemberDto,
});

export type CreateParticipantDto = Static<typeof CreateParticipantDto>;
