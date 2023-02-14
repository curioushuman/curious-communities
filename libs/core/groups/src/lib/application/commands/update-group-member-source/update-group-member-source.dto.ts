import { Record, Static } from 'runtypes';
import {
  GroupMember,
  parseGroupMember,
} from '../../../domain/entities/group-member';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';

/**
 * Info required to create a groupMemberSource from groupMember
 */
export const UpdateGroupMemberSourceDto = Record({
  groupMember: GroupMember,
  groupMemberSource: GroupMemberSource,
});

export type UpdateGroupMemberSourceDto = Static<
  typeof UpdateGroupMemberSourceDto
>;

/**
 * An alternative parser, instead of UpdateGroupMemberSourceDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseUpdateGroupMemberSourceDto = (
  dto: UpdateGroupMemberSourceDto
): UpdateGroupMemberSourceDto => {
  const { groupMember, groupMemberSource } = dto;

  return {
    groupMember: parseGroupMember(groupMember),
    groupMemberSource: GroupMemberSource.check(groupMemberSource),
  };
};
