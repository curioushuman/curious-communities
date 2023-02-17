import { Record, Static } from 'runtypes';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * An optional type if the structure for entity creation is different
 * - e.g. EdApp requires a password and connection, but doesn't return them
 */
export const EdAppApiGroupMemberSourceForCreate = Record({
  userId: MemberSourceId,
});

export type EdAppApiGroupMemberSourceForCreate = Static<
  typeof EdAppApiGroupMemberSourceForCreate
>;
