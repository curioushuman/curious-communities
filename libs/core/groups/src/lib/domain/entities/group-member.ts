import { Array, Record, Static } from 'runtypes';

import { GroupBase } from './group';
import { GroupMemberId } from '../value-objects/group-member-id';
import { GroupMemberStatus } from '../value-objects/group-member-status';
import { AccountSlug } from '../value-objects/account-slug';
import { GroupMemberName } from '../value-objects/group-member-name';
import { GroupMemberEmail } from '../value-objects/group-member-email';
import { GroupMemberOrganisationName } from '../value-objects/group-member-organisation-name';
import {
  GroupMemberSourceIdSource,
  GroupMemberSourceIdSourceValue,
} from '../value-objects/group-member-source-id-source';
import { prepareExternalIdSource, ValueOf } from '@curioushuman/common';
import { GroupMemberSourceId } from '../value-objects/group-member-source-id';
import { Source } from '../value-objects/source';
import { GroupId } from '../value-objects/group-id';
import { MemberId } from '../value-objects/member-id';

/**
 * Base type for internal group member entity
 *
 * i.e. just the fields
 */
export const GroupMemberBase = Record({
  id: GroupMemberId,
  memberId: MemberId,
  groupId: GroupId,
  status: GroupMemberStatus,

  sourceIds: Array(GroupMemberSourceIdSource),

  name: GroupMemberName,
  email: GroupMemberEmail,
  organisationName: GroupMemberOrganisationName,

  // e.g. APF being the account that owns this member
  accountOwner: AccountSlug,
});

/**
 * Base type for internal group member entity
 *
 * i.e. just the fields
 */
export type GroupMemberBase = Static<typeof GroupMemberBase>;

/**
 * Type for internal group member entity
 */
export const GroupMember = GroupMemberBase.extend({
  // group info
  group: GroupBase,
});

/**
 * Type for internal member entity
 */
export type GroupMember = Static<typeof GroupMember>;

/**
 * An alternate version of GroupMember that excludes the ID
 * as we don't know it yet, we're going to pass everything else
 * to see if we can identify the member
 */
export const GroupMemberForIdentify = GroupMemberBase.omit('id');

/**
 * An alternate version of GroupMember used for identification
 * of group member when Id is not present
 */
export type GroupMemberForIdentify = Static<typeof GroupMemberForIdentify>;

/**
 * An alternate version of GroupMember that includes the group
 * as it is required for identification of source by entity in
 * the group member source repository
 *
 * NOTE: remains a separate type, in case the similarity differs
 */
export const GroupMemberForSourceIdentify = GroupMember.withBrand(
  'GroupMemberForSourceIdentify'
);

/**
 * An alternate version of GroupMember that includes the group
 * as the group is required for identification by entity
 */
export type GroupMemberForSourceIdentify = Static<
  typeof GroupMemberForSourceIdentify
>;

/**
 * Type that defines all the possible identifiers for a member
 * NOTE: this is utilized in find-member.dto.ts and member.repository.ts
 * to define parsers and finders.
 */
export type GroupMemberIdentifiers = {
  id: GroupMemberId;
  idSourceValue: GroupMemberSourceIdSourceValue;
  entity: GroupMemberForIdentify;
};
export type GroupMemberIdentifier = keyof GroupMemberIdentifiers;
export type GroupMemberIdentifierValue = ValueOf<GroupMemberIdentifiers>;

/**
 * Convenience function to prepare a GroupMemberSourceIdSource
 */
export function prepareGroupMemberExternalIdSource(
  idSourceValue: string
): GroupMemberSourceIdSource {
  return prepareExternalIdSource(idSourceValue, GroupMemberSourceId, Source);
}
