import { Record, Static } from 'runtypes';

import { GroupMemberId } from '../../../domain/value-objects/group-member-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateGroupMemberDto = Record({
  id: GroupMemberId,
});

export type UpdateGroupMemberDto = Static<typeof UpdateGroupMemberDto>;
