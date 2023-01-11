import { Record, Static } from 'runtypes';

import { ParticipantSourceStatus } from '../value-objects/participant-source-status';
import { ParticipantName } from '../value-objects/participant-name';
import { ParticipantEmail } from '../value-objects/participant-email';
import { ParticipantOrganisationName } from '../value-objects/participant-organisation-name';
import { ParticipantSourceId } from '../value-objects/participant-source-id';
import { CourseSourceId } from '../value-objects/course-source-id';

export const ParticipantSource = Record({
  id: ParticipantSourceId,
  courseId: CourseSourceId,
  status: ParticipantSourceStatus,

  name: ParticipantName,
  email: ParticipantEmail,
  organisationName: ParticipantOrganisationName,
});

export type ParticipantSource = Static<typeof ParticipantSource>;
