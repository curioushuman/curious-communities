import { Array, Record, Static } from 'runtypes';

import { CourseBase } from './course';
import { ParticipantId } from '../value-objects/participant-id';
import { ParticipantStatus } from '../value-objects/participant-status';
import { AccountSlug } from '../value-objects/account-slug';
import { ParticipantName } from '../value-objects/participant-name';
import { ParticipantEmail } from '../value-objects/participant-email';
import { ParticipantOrganisationName } from '../value-objects/participant-organisation-name';
import {
  ParticipantSourceIdSource,
  ParticipantSourceIdSourceValue,
} from '../value-objects/participant-source-id-source';
import { prepareExternalIdSource, ValueOf } from '@curioushuman/common';
import { ParticipantSourceId } from '../value-objects/participant-source-id';
import { Source } from '../value-objects/source';
import { CourseId } from '../value-objects/course-id';
import { MemberId } from '../value-objects/member-id';

/**
 * Base type for internal participant entity
 *
 * i.e. just the fields
 */
export const ParticipantBase = Record({
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
 * Base type for internal participant entity
 *
 * i.e. just the fields
 */
export type ParticipantBase = Static<typeof ParticipantBase>;

/**
 * Type for internal participant entity
 */
export const Participant = ParticipantBase.extend({
  // course info
  course: CourseBase,
});

/**
 * Type for internal member entity
 */
export type Participant = Static<typeof Participant>;

/**
 * ----
 * Additional helper types used during identification
 * ----
 */

/**
 * An alternate version of Participant that excludes the ID
 * as we don't know it yet, we're going to pass everything else
 * to see if we can identify the member
 */
export const ParticipantForIdentify = ParticipantBase.omit('id');

/**
 * An alternate version of Participant used for identification
 * of participant when Id is not present
 */
export type ParticipantForIdentify = Static<typeof ParticipantForIdentify>;

/**
 * An alternate version of Participant that includes the course
 * as it is required for identification of source by entity in
 * the participant source repository
 *
 * NOTE: remains a separate type, in case the similarity differs
 */
export const ParticipantForSourceIdentify = Participant.withBrand(
  'ParticipantForSourceIdentify'
);

/**
 * An alternate version of Participant that includes the course
 * as the course is required for identification by entity
 */
export type ParticipantForSourceIdentify = Static<
  typeof ParticipantForSourceIdentify
>;

/**
 * Type that defines all the possible identifiers for a member
 * NOTE: this is utilized in find-member.dto.ts and member.repository.ts
 * to define parsers and finders.
 */
export type ParticipantIdentifiers = {
  id: ParticipantId;
  idSourceValue: ParticipantSourceIdSourceValue;
  // entity: ParticipantForIdentify;
};
export type ParticipantIdentifier = keyof ParticipantIdentifiers;
export type ParticipantIdentifierValue = ValueOf<ParticipantIdentifiers>;

/**
 * ----
 * Additional helper types used during creation
 * ----
 */

/**
 * This is the information we receive from the participant source
 *
 * NOTE: Runtype.pick does not result in a class that includes everything a Runtype.Record has
 * specifically recursive checking. So, as ParticipantBase include an Array of ParticipantSourceIdSource
 * it breaks when we attempt to run ParticipantFromSource.check() on it.
 *
 * Current solution is to not use .check() for these interim types, and only call it on the final
 * type that is used for validation i.e. ParticipantBase or Participant itself.
 */
export const ParticipantFromSource = ParticipantBase.pick(
  'id',
  'status',
  'sourceIds',
  'accountOwner'
);

/**
 * This is the information we receive from the participant source
 */
export type ParticipantFromSource = Static<typeof ParticipantFromSource>;

/**
 * This is the information we receive from the member
 *
 * NOTE: similarly we will be unable to use this for runtype checking
 *
 */
export const ParticipantFromSourceAndMember = ParticipantBase.pick(
  'id',
  'accountOwner',
  'status',
  'sourceIds',

  'memberId',
  'name',
  'email',
  'organisationName'
);

/**
 * This is the information we receive from the member
 */
export type ParticipantFromSourceAndMember = Static<
  typeof ParticipantFromSourceAndMember
>;

/**
 * ----
 * Other related helper functions
 * ----
 */

/**
 * Convenience function to prepare a ParticipantSourceIdSource
 */
export function prepareParticipantExternalIdSource(
  idSourceValue: string
): ParticipantSourceIdSource {
  return prepareExternalIdSource(idSourceValue, ParticipantSourceId, Source);
}
