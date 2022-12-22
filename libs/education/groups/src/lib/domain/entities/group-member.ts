import { Record, Static } from 'runtypes';

import { GroupMemberId } from '../value-objects/group-member-id';
import { GroupMemberStatus } from '../value-objects/group-member-status';
import { AccountSlug } from '../value-objects/account-slug';
import { MemberId } from '../value-objects/member-id';
import { GroupId } from '../value-objects/group-id';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';

/**
 * Runtypes constant for the (internal) GroupMember entity
 * Used for type checking and validation
 */
export const GroupMember = Record({
  id: GroupMemberId,
  memberId: MemberId,
  groupId: GroupId,
  status: GroupMemberStatus,

  memberName: MemberName,
  memberEmail: MemberEmail,
  memberOrganisationName: MemberOrganisationName,

  // e.g. APF being the account that owns this group-member
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) group-member entity
 */
export type GroupMember = Static<typeof GroupMember>;

/**
 * Type that defines all the possible identifiers for a group-member
 * NOTE: this is utilized in find-group-member.dto.ts and group-member.repository.ts
 * to define parsers and finders.
 */
export type GroupMemberIdentifiers = {
  id: GroupMemberId;
};
export type GroupMemberIdentifier = keyof GroupMemberIdentifiers;
