import { Record, Static } from 'runtypes';

import { MemberId } from '../value-objects/member-id';
import { AccountSlug } from '../value-objects/account-slug';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';

/**
 * Runtypes constant for the (internal) Member entity
 * Used for type checking and validation
 */
export const Member = Record({
  id: MemberId,

  name: MemberName,
  email: MemberEmail,
  organisationName: MemberOrganisationName,

  // e.g. APF being the account that owns this participant
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) participant entity
 */
export type Member = Static<typeof Member>;

/**
 * The below are additional types used during the creation of a participant
 */

/**
 * This is the information we require from the course
 */
export const MemberForCreate = Member.omit('accountOwner');

export type MemberForCreate = Static<typeof MemberForCreate>;
