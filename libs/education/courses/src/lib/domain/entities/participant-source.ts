import { Record, Static } from 'runtypes';

import { ParticipantSourceStatus } from '../value-objects/participant-source-status';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';
import { ParticipantSourceId } from '../value-objects/participant-source-id';
import { CourseSourceId } from '../value-objects/course-source-id';

export const ParticipantSource = Record({
  id: ParticipantSourceId,
  courseId: CourseSourceId,
  status: ParticipantSourceStatus,

  memberName: MemberName,
  memberEmail: MemberEmail,
  memberOrganisationName: MemberOrganisationName,
});

export type ParticipantSource = Static<typeof ParticipantSource>;

/**
 * The below are additional types used during the creation of a participant
 */

/**
 * This is the information we require from the participant source
 */
export const ParticipantSourceForCreate = ParticipantSource.pick(
  'id',
  'status'
);

export type ParticipantSourceForCreate = Static<
  typeof ParticipantSourceForCreate
>;
