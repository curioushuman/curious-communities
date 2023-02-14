import { Record, Static, String } from 'runtypes';
import { GroupMemberEmail } from '../../../../domain/value-objects/group-member-email';
import { GroupMemberName } from '../../../../domain/value-objects/group-member-name';
import { GroupMemberSourceId } from '../../../../domain/value-objects/group-member-source-id';

/**
 * Some personal info stored in a sub-object
 */
export const TribeApiGroupMemberSourceProfile = Record({
  name: GroupMemberName,
});

/**
 * This represents data we expect from Tribe
 * - some fields may be empty
 * - Tribe generally loves to return them as Null
 */
export const TribeApiGroupMemberSource = Record({
  id: GroupMemberSourceId,
  email: GroupMemberEmail,
  profile: TribeApiGroupMemberSourceProfile,
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
