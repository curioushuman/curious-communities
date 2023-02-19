import { Record, Static } from 'runtypes';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';

/**
 * Info required to create a groupMemberSource from groupMember
 */
export const DeleteGroupMemberSourceDto = Record({
  groupMemberSource: GroupMemberSource,
});

export type DeleteGroupMemberSourceDto = Static<
  typeof DeleteGroupMemberSourceDto
>;
