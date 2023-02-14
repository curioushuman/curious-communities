import { Record, Static } from 'runtypes';

import { ParticipantSourceStatus } from '../value-objects/participant-source-status';
import { ParticipantSourceId } from '../value-objects/participant-source-id';
import { ParticipantSourceIdSource } from '../value-objects/participant-source-id-source';
import { Source } from '../value-objects/source';
import { CourseSourceId } from '../value-objects/course-source-id';
import { MemberEmail } from '../value-objects/member-email';

export const ParticipantSource = Record({
  id: ParticipantSourceId,
  source: Source,
  courseId: CourseSourceId,
  memberEmail: MemberEmail,

  status: ParticipantSourceStatus,
});

export type ParticipantSource = Static<typeof ParticipantSource>;

/**
 * Type that defines all the possible identifiers for a course
 * NOTE: this is utilized in find-course.dto.ts and course.repository.ts
 * to define parsers and finders.
 */
export type ParticipantSourceIdentifiers = {
  idSource: ParticipantSourceIdSource;
};
export type ParticipantSourceIdentifier = keyof ParticipantSourceIdentifiers;
