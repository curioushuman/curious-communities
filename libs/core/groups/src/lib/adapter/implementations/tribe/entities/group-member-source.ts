import { Record, Static } from 'runtypes';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * An optional type if the structure for entity creation is different
 * - e.g. Tribe requires a password and connection, but doesn't return them
 */
export const TribeApiGroupMemberSourceForCreate = Record({
  user: MemberSourceId,
});

export type TribeApiGroupMemberSourceForCreate = Static<
  typeof TribeApiGroupMemberSourceForCreate
>;
