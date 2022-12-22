import { Record, Static } from 'runtypes';

import { GroupMemberId } from '../../../domain/value-objects/group-member-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateGroupMemberDto = Record({
  id: GroupMemberId,
});

export type CreateGroupMemberDto = Static<typeof CreateGroupMemberDto>;
