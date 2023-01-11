import { Array, Record, Static } from 'runtypes';

import { ParticipantId } from '../value-objects/participant-id';
import { ParticipantStatus } from '../value-objects/participant-status';
import { AccountSlug } from '../value-objects/account-slug';
import { MemberId } from '../value-objects/member-id';
import { ParticipantName } from '../value-objects/participant-name';
import { ParticipantEmail } from '../value-objects/participant-email';
import { ParticipantOrganisationName } from '../value-objects/participant-organisation-name';
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

  name: ParticipantName,
  email: ParticipantEmail,
  organisationName: ParticipantOrganisationName,

  // e.g. APF being the account that owns this participant
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) participant entity
 */
export type Participant = Static<typeof Participant>;

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

/**
 * The below are additional types used during the creation of a participant
 */

/**
 * This is the information we receive from the participant source
 */
export const ParticipantFromSource = Participant.pick(
  'id',
  'accountOwner',
  'status',
  'sourceIds'
);

/**
 * This is the information we receive from the participant source
 */
export type ParticipantFromSource = Static<typeof ParticipantFromSource>;

/**
 * This is the information we receive from the course,
 * built on top of what was received from source
 */
export const ParticipantFromSourceAndCourse = Participant.pick(
  'status',
  'sourceIds',
  'courseId'
);

/**
 * This is the information we receive from the course
 */
export type ParticipantFromSourceAndCourse = Static<
  typeof ParticipantFromSourceAndCourse
>;

/**
 * This is the information we receive from the member
 */
export const ParticipantFromMember = Participant.pick(
  'memberId',
  'name',
  'email',
  'organisationName'
);

/**
 * This is the information we receive from the member
 */
export type ParticipantFromMember = Static<typeof ParticipantFromMember>;
