import { Record, Static } from 'runtypes';
import { GroupMemberBase } from '../../../domain/entities/group-member';
import { Source } from '../../../domain/value-objects/source';

/**
 * Info required to create a groupSource from group
 */
export const CreateGroupMemberSourceDto = Record({
  source: Source,
  groupMember: GroupMemberBase,
});

export type CreateGroupMemberSourceDto = Static<
  typeof CreateGroupMemberSourceDto
>;
