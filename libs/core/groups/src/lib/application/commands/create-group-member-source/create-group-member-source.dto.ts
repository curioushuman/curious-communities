import { Record, Static } from 'runtypes';
import {
  GroupMember,
  parseGroupMember,
} from '../../../domain/entities/group-member';
import { GroupSource } from '../../../domain/entities/group-source';

/**
 * Info required to create a groupSource from group
 */
export const CreateGroupMemberSourceDto = Record({
  groupSource: GroupSource,
  groupMember: GroupMember,
});

export type CreateGroupMemberSourceDto = Static<
  typeof CreateGroupMemberSourceDto
>;

/**
 * An alternative parser, instead of CreateGroupMemberSourceDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseCreateGroupMemberSourceDto = (
  dto: CreateGroupMemberSourceDto
): CreateGroupMemberSourceDto => {
  const { groupMember, groupSource } = dto;

  return {
    groupMember: parseGroupMember(groupMember),
    groupSource: GroupSource.check(groupSource),
  };
};
