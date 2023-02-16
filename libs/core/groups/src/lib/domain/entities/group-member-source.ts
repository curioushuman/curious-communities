import { Record, Static } from 'runtypes';

import { GroupMemberSourceStatus } from '../value-objects/group-member-source-status';
import { Source } from '../value-objects/source';
import { GroupSourceId } from '../value-objects/group-source-id';
import { MemberSourceId } from '../value-objects/member-source-id';
import { MemberEmail } from '../value-objects/member-email';

export const GroupMemberSource = Record({
  source: Source,
  groupId: GroupSourceId,
  memberId: MemberSourceId,
  memberEmail: MemberEmail,

  status: GroupMemberSourceStatus,
});

export type GroupMemberSource = Static<typeof GroupMemberSource>;

/**
 * Type for external group member entity, minus Id and source
 * Used for creating a new group member
 */
export const GroupMemberSourceForCreate = GroupMemberSource.withBrand(
  'GroupMemberSourceForCreate'
);
/**
 * Type for external group member entity, minus Id and source
 * Used for creating a new group member
 */
export type GroupMemberSourceForCreate = Static<
  typeof GroupMemberSourceForCreate
>;

/**
 * Type that defines all the possible identifiers for a group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export type GroupMemberSourceIdentifiers = {
  memberId: MemberSourceId;
  memberEmail: MemberEmail;
};
export type GroupMemberSourceIdentifier = keyof GroupMemberSourceIdentifiers;
