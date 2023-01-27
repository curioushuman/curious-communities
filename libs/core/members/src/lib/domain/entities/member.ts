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
import { prepareExternalIdSource, ValueOf } from '@curioushuman/common';
import { MemberSourceId } from '../value-objects/member-source-id';
import { Source } from '../value-objects/source';

/**
 * Type for internal member entity
 */
export const Member = Record({
  id: MemberId,
  sourceIds: Array(MemberSourceIdSource),

  status: MemberStatus,
  name: MemberName,
  email: MemberEmail,
  organisationName: MemberOrganisationName,

  // e.g. APF being the account that owns this member
  accountOwner: AccountSlug,
});

/**
 * Type for internal member entity
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

/**
 * Convenience function to prepare a MemberSourceIdSource
 */
export function prepareMemberExternalIdSource(
  idSourceValue: string
): MemberSourceIdSource {
  return prepareExternalIdSource(idSourceValue, MemberSourceId, Source);
}
