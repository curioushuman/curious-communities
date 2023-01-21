import { Record, Static } from 'runtypes';

import { MemberDto } from '../../../infra/dto/member.dto';
import { CourseBase } from '../../../domain/entities/course';
import { ParticipantSource } from '../../../domain/entities/participant-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateParticipantDto = Record({
  participantSource: ParticipantSource,
  course: CourseBase,
  member: MemberDto,
});

export type CreateParticipantDto = Static<typeof CreateParticipantDto>;
