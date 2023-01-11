import { Record, Static } from 'runtypes';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { Source } from '../../../domain/value-objects/source';

/**
 * Info required to create a groupSource from group
 */
export const UpdateGroupMemberSourceDto = Record({
  source: Source,
  groupMember: GroupMember,
  groupMemberSource: GroupMemberSource,
});

export type UpdateGroupMemberSourceDto = Static<
  typeof UpdateGroupMemberSourceDto
>;
