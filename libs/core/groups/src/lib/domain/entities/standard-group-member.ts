import { Record, Static } from 'runtypes';

import { GroupMemberId } from '../value-objects/group-member-id';
import { GroupMemberStatus } from '../value-objects/group-member-status';
import { AccountSlug } from '../value-objects/account-slug';
import { GroupId } from '../value-objects/group-id';
import { MemberId } from '../value-objects/member-id';
import { StandardGroupBase } from './standard-group';
import { GroupMemberType } from '../value-objects/group-member-type';
import { Member } from './member';

/**
 * Base type for internal groupMember entity
 *
 * i.e. just the fields
 */
export const StandardGroupMemberBase = Record({
  _type: GroupMemberType,
  id: GroupMemberId,
  memberId: MemberId,
  groupId: GroupId,

  status: GroupMemberStatus,

  // e.g. APF being the account that owns this groupMember
  accountOwner: AccountSlug,
});

/**
 * Base type for internal groupMember entity
 *
 * i.e. just the fields
 */
export type StandardGroupMemberBase = Static<typeof StandardGroupMemberBase>;

/**
 * Type for internal groupMember entity
 */
export const StandardGroupMember = StandardGroupMemberBase.extend({
  // group info
  group: StandardGroupBase,
  // member info
  member: Member,
});

/**
 * Type for internal member entity
 */
export type StandardGroupMember = Static<typeof StandardGroupMember>;

/**
 * ----
 * Additional helper types used during identification
 * ----
 */

/**
 * An alternate version of GroupMember that excludes the ID
 * as we don't know it yet, we're going to pass everything else
 * to see if we can identify the member
 */
export const StandardGroupMemberForIdentify =
  StandardGroupMemberBase.omit('id');

/**
 * An alternate version of GroupMember used for identification
 * of groupMember when Id is not present
 */
export type StandardGroupMemberForIdentify = Static<
  typeof StandardGroupMemberForIdentify
>;

/**
 * An alternate version of GroupMember that includes the group
 * as it is required for identification of source by entity in
 * the groupMember source repository
 *
 * NOTE: remains a separate type, in case the similarity differs
 */
export const StandardGroupMemberForSourceIdentify =
  StandardGroupMember.withBrand('StandardGroupMemberForSourceIdentify');

/**
 * An alternate version of GroupMember that includes the group
 * as the group is required for identification by entity
 */
export type StandardGroupMemberForSourceIdentify = Static<
  typeof StandardGroupMemberForSourceIdentify
>;

/**
 * Type that defines all the possible identifiers for a STANDARD group member
 * NOTE: this is utilized in find-member.dto.ts and member.repository.ts
 * to define parsers and finders.
 *
 * UPDATE: removed id and entity until they are required and we have more context
 *
 * TODO:
 * - [ ] put ID back in place
 */
export type StandardGroupMemberIdentifiers = {
  memberId: MemberId;
};
export type StandardGroupMemberIdentifier =
  keyof StandardGroupMemberIdentifiers;
