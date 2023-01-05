import { Record, Static } from 'runtypes';

import { CourseForCreate } from '../../../domain/entities/course';
import { MemberForCreate } from '../../../domain/entities/member';
import { ParticipantSourceForCreate } from '../../../domain/entities/participant-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateParticipantDto = Record({
  participantSource: ParticipantSourceForCreate,
  course: CourseForCreate,
  member: MemberForCreate,
});

export type CreateParticipantDto = Static<typeof CreateParticipantDto>;
