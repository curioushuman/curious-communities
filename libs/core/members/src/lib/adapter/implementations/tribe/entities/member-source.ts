import { Record, Static, String } from 'runtypes';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberName } from '../../../../domain/value-objects/member-name';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * Some personal info stored in a sub-object
 */
export const TribeApiMemberSourceProfile = Record({
  name: MemberName,
});

/**
 * This represents data we expect from Tribe
 * - some fields may be empty
 * - Tribe generally loves to return them as Null
 */
export const TribeApiMemberSource = Record({
  id: MemberSourceId,
  email: MemberEmail,
  profile: TribeApiMemberSourceProfile,
});

export type TribeApiMemberSource = Static<typeof TribeApiMemberSource>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Tribe requires a password and connection, but doesn't return them
 */
export const TribeApiMemberSourceForCreate = Record({
  name: MemberName,
  email: MemberEmail,
  password: String,
  role: String,
  source: String,
});

export type TribeApiMemberSourceForCreate = Static<
  typeof TribeApiMemberSourceForCreate
>;

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Tribe requires a password and connection, but doesn't return them
 */
export const TribeApiMemberSourceForUpdate = Record({
  name: MemberName,
  email: MemberEmail,
});

export type TribeApiMemberSourceForUpdate = Static<
  typeof TribeApiMemberSourceForUpdate
>;
