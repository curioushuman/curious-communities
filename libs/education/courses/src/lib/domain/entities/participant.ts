import { Array, Record, Static } from 'runtypes';

import { ParticipantId } from '../value-objects/participant-id';
import { ParticipantStatus } from '../value-objects/participant-status';
import { AccountSlug } from '../value-objects/account-slug';
import { MemberId } from '../value-objects/member-id';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';
import { CourseId } from '../value-objects/course-id';
import {
  ParticipantSourceIdSource,
  ParticipantSourceIdSourceValue,
} from '../value-objects/participant-source-id-source';
import { ValueOf } from '@curioushuman/common';

/**
 * Runtypes constant for the (internal) Participant entity
 * Used for type checking and validation
 */
export const Participant = Record({
  id: ParticipantId,
  memberId: MemberId,
  courseId: CourseId,
  status: ParticipantStatus,

  sourceIds: Array(ParticipantSourceIdSource),

  memberName: MemberName,
  memberEmail: MemberEmail,
  memberOrganisationName: MemberOrganisationName,

  // e.g. APF being the account that owns this participant
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) participant entity
 */
export type Participant = Static<typeof Participant>;

/**
 * Partial participant record, used to gather data from various
 * sources prior to creating a participant
 */
// export const ParticipantPartial = Partial(Participant);

/**
 * Type for the (internal) participant entity
 */
export type ParticipantPartial = Partial<Participant>;

/**
 * Type that defines all the possible identifiers for a participant
 * NOTE: this is utilized in find-participant.dto.ts and participant.repository.ts
 * to define parsers and finders.
 */
export type ParticipantIdentifiers = {
  id: ParticipantId;
  idSourceValue: ParticipantSourceIdSourceValue;
};
export type ParticipantIdentifier = keyof ParticipantIdentifiers;
export type ParticipantIdentifierValue = ValueOf<ParticipantIdentifiers>;
