import { Record, Static } from 'runtypes';
import { GroupMemberSourceId } from '../../../../domain/value-objects/group-member-source-id';
import { GroupSourceId } from '../../../../domain/value-objects/group-source-id';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * This represents data we expect from Tribe
 * - some fields may be empty
 * - Tribe generally loves to return them as Null
 */
export const TribeApiGroupMemberSource = Record({
  groupId: GroupSourceId,
  memberId: MemberSourceId,
  memberEmail: MemberEmail,
});

export type TribeApiGroupMemberSource = Static<
  typeof TribeApiGroupMemberSource
>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Tribe requires a password and connection, but doesn't return them
 */
export const TribeApiGroupMemberSourceForCreate = Record({
  user: GroupMemberSourceId,
});

export type TribeApiGroupMemberSourceForCreate = Static<
  typeof TribeApiGroupMemberSourceForCreate
>;
