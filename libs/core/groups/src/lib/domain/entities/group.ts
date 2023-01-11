import { Array, Record, Static } from 'runtypes';

import { GroupId } from '../value-objects/group-id';
import { GroupStatus } from '../value-objects/group-status';
import { AccountSlug } from '../value-objects/account-slug';
import { GroupName } from '../value-objects/group-name';
import {
  GroupSourceIdSource,
  GroupSourceIdSourceValue,
} from '../value-objects/group-source-id-source';
import { prepareExternalIdSource, ValueOf } from '@curioushuman/common';
import { GroupSourceId } from '../value-objects/group-source-id';
import { Source } from '../value-objects/source';
import { GroupSlug } from '../value-objects/group-slug';
import { GroupType } from '../value-objects/group-type';
import { GroupMemberBase } from './group-member';

/**
 * Base type for internal group entity
 *
 * i.e. just the fields
 */
export const GroupBase = Record({
  id: GroupId,
  status: GroupStatus,
  type: GroupType,
  slug: GroupSlug,

  sourceIds: Array(GroupSourceIdSource),

  name: GroupName,

  // e.g. APF being the account that owns this group
  accountOwner: AccountSlug,
});

/**
 * Base type for internal group entity
 *
 * i.e. just the fields
 */
export type GroupBase = Static<typeof GroupBase>;

/**
 * Type for internal group entity
 *
 * i.e. fields + relationships
 *
 * * NOTE: I've had to duplicate this extension over at CourseGroup
 */
export const Group = GroupBase.extend({
  members: Array(GroupMemberBase),
});

/**
 * Type for internal group entity
 *
 * i.e. fields + relationships
 */
export type Group = Static<typeof Group>;

/**
 * Type that defines all the possible identifiers for a group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export interface GroupIdentifiers {
  id: GroupId;
  idSourceValue: GroupSourceIdSourceValue;
  slug: GroupSlug;
}
export type GroupIdentifier = keyof GroupIdentifiers;
export type GroupIdentifierValue = ValueOf<GroupIdentifiers>;

/**
 * Convenience function to prepare a GroupSourceIdSource
 */
export function prepareGroupExternalIdSource(
  idSourceValue: string
): GroupSourceIdSource {
  return prepareExternalIdSource(idSourceValue, GroupSourceId, Source);
}
