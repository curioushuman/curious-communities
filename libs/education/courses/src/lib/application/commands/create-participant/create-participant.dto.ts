import { Record, Static } from 'runtypes';

import { CourseBase } from '../../../domain/entities/course';
import { Member } from '../../../domain/entities/member';
import { ParticipantSource } from '../../../domain/entities/participant-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateParticipantDto = Record({
  participantSource: ParticipantSource,
  course: CourseBase,
  member: Member,
});

export type CreateParticipantDto = Static<typeof CreateParticipantDto>;
