import { Record, Static } from 'runtypes';

import { ParticipantSourceStatus } from '../value-objects/participant-source-status';
import { ParticipantId } from '../value-objects/participant-id';
import { MemberId } from '../value-objects/member-id';
import { CourseId } from '../value-objects/course-id';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';

export const ParticipantSource = Record({
  id: ParticipantId,
  memberId: MemberId,
  courseId: CourseId,
  status: ParticipantSourceStatus,

  memberName: MemberName,
  memberEmail: MemberEmail,
  memberOrganisationName: MemberOrganisationName,
});

export type ParticipantSource = Static<typeof ParticipantSource>;
