import { Record, Static } from 'runtypes';

import { MemberName } from '../value-objects/member-name';
import { MemberIdExternal } from '../value-objects/member-id-external';
import { MemberStatus } from '../value-objects/member-status';
import { AccountSlug } from '../value-objects/account-slug';
import { MemberSlug } from '../value-objects/member-slug';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';

/**
 * Runtypes constant for the (internal) Member entity
 * Used for type checking and validation
 */
export const Member = Record({
  externalId: MemberIdExternal,
  slug: MemberSlug,
  status: MemberStatus,
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
  externalId: MemberIdExternal;
  slug: MemberSlug;
};
export type MemberIdentifier = keyof MemberIdentifiers;
