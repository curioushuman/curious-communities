import { Record, Static } from 'runtypes';

import { Timestamp, YearMonth } from '@curioushuman/common';

import { GroupName } from '../value-objects/group-name';
import { GroupId } from '../value-objects/group-id';
import { GroupStatus } from '../value-objects/group-status';
import { GroupSupportType } from '../value-objects/group-support-type';
import { AccountSlug } from '../value-objects/account-slug';
import { GroupSlug } from '../value-objects/group-slug';

/**
 * Runtypes constant for the (internal) Group entity
 * Used for type checking and validation
 */
export const Group = Record({
  id: GroupId,
  slug: GroupSlug,
  status: GroupStatus,
  supportType: GroupSupportType,
  name: GroupName,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
  yearMonthOpen: YearMonth,
  // e.g. APF being the account that owns this group
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) group entity
 */
export type Group = Static<typeof Group>;

/**
 * Type that defines all the possible identifiers for a group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export type GroupIdentifiers = {
  id: GroupId;
  slug: GroupSlug;
};
export type GroupIdentifier = keyof GroupIdentifiers;
