import { Record, Static } from 'runtypes';

import { ParticipantSourceStatus } from '../value-objects/participant-source-status';
import { ParticipantName } from '../value-objects/participant-name';
import { ParticipantEmail } from '../value-objects/participant-email';
import { ParticipantOrganisationName } from '../value-objects/participant-organisation-name';
import { ParticipantSourceId } from '../value-objects/participant-source-id';
import { ParticipantSourceIdSource } from '../value-objects/participant-source-id-source';

export const ParticipantSource = Record({
  id: ParticipantSourceId,
  courseId: ParticipantSourceId,
  status: ParticipantSourceStatus,

  name: ParticipantName,
  email: ParticipantEmail,
  organisationName: ParticipantOrganisationName,
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
// NOTE: the ValueOf utility type doesn't work when there is only a single identifier
// export type ParticipantSourceIdentifierValue = ValueOf<ParticipantSourceIdentifier>;
export type ParticipantSourceIdentifierValue = ParticipantSourceIdSource;
