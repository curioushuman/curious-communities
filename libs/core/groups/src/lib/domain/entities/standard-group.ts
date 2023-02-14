import { Array, Record, Static } from 'runtypes';

import { GroupId } from '../value-objects/group-id';
import { GroupStatus } from '../value-objects/group-status';
import { AccountSlug } from '../value-objects/account-slug';
import { GroupName } from '../value-objects/group-name';
import {
  GroupSourceIdSource,
  GroupSourceIdSourceValue,
} from '../value-objects/group-source-id-source';
import { GroupSlug } from '../value-objects/group-slug';
import { StandardGroupMemberBase } from './standard-group-member';
import { GroupType } from '../value-objects/group-type';

/**
 * Base type for internal group entity
 *
 * i.e. just the fields
 */
export const StandardGroupBase = Record({
  _type: GroupType,
  id: GroupId,

  sourceIds: Array(GroupSourceIdSource),

  slug: GroupSlug,
  status: GroupStatus,
  name: GroupName,
  // e.g. APF being the account that owns this group
  accountOwner: AccountSlug,
});

/**
 * Base type for internal group entity
 *
 * i.e. just the fields
 */
export type StandardGroupBase = Static<typeof StandardGroupBase>;

/**
 * Type for internal group entity
 *
 * i.e. fields + relationships
 *
 * * NOTE: I've had to duplicate this extension over at GroupGroup
 */
export const StandardGroup = StandardGroupBase.extend({
  groupMembers: Array(StandardGroupMemberBase),
});

/**
 * Type for internal group entity
 *
 * i.e. fields + relationships
 */
export type StandardGroup = Static<typeof StandardGroup>;

/**
 * Type that defines all the possible identifiers for a standard group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export interface StandardGroupIdentifiers {
  id: GroupId;
  idSourceValue: GroupSourceIdSourceValue;
  slug: GroupSlug;
}
export type StandardGroupIdentifier = keyof StandardGroupIdentifiers;
