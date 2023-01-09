import { Record, Static } from 'runtypes';

import { ValueOf } from '@curioushuman/common';

import { MemberSourceStatus } from '../value-objects/member-source-status';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';
import { MemberSourceId } from '../value-objects/member-source-id';
import { MemberSourceIdSource } from '../value-objects/member-source-id-source';

/**
 * Type for external member entity
 */
export const MemberSource = Record({
  id: MemberSourceId,
  status: MemberSourceStatus,

  name: MemberName,
  email: MemberEmail,
  organisationName: MemberOrganisationName,
});

/**
 * Type for external member entity
 */
export type MemberSource = Static<typeof MemberSource>;

/**
 * Type for external member entity, minus Id
 * Used for creating a new member
 */
export const MemberSourceForCreate = MemberSource.omit('id');
/**
 * Type for external member entity, minus Id
 * Used for creating a new member
 */
export type MemberSourceForCreate = Static<typeof MemberSourceForCreate>;

/**
 * Type that defines all the possible identifiers for a member
 * NOTE: this is utilized in find-member.dto.ts and member.repository.ts
 * to define parsers and finders.
 */
export type MemberSourceIdentifiers = {
  idSource: MemberSourceIdSource;
  email: MemberEmail;
};
export type MemberSourceIdentifier = keyof MemberSourceIdentifiers;
export type MemberSourceIdentifierValue = ValueOf<MemberSourceIdentifiers>;
