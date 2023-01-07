import { Array, Record, Static } from 'runtypes';

import { MemberId } from '../value-objects/member-id';
import { MemberStatus } from '../value-objects/member-status';
import { AccountSlug } from '../value-objects/account-slug';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';
import {
  MemberSourceIdSource,
  MemberSourceIdSourceValue,
} from '../value-objects/member-source-id-source';
import { ValueOf } from '@curioushuman/common';

/**
 * Runtypes constant for the (internal) Member entity
 * Used for type checking and validation
 */
export const Member = Record({
  id: MemberId,
  status: MemberStatus,

  sourceIds: Array(MemberSourceIdSource),

  name: MemberName,
  email: MemberEmail,
  organisationName: MemberOrganisationName,

  // e.g. APF being the account that owns this member
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) member entity
 */
export type Member = Static<typeof Member>;

/**
 * Type that defines all the possible identifiers for a member
 * NOTE: this is utilized in find-member.dto.ts and member.repository.ts
 * to define parsers and finders.
 */
export type MemberIdentifiers = {
  id: MemberId;
  idSourceValue: MemberSourceIdSourceValue;
  email: MemberEmail;
};
export type MemberIdentifier = keyof MemberIdentifiers;
export type MemberIdentifierValue = ValueOf<MemberIdentifiers>;
