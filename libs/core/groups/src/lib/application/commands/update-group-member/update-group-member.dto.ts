import { Null, Optional, Record, Static } from 'runtypes';
import {
  GroupMember,
  parseGroupMember,
} from '../../../domain/entities/group-member';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { ParticipantDto } from '../../../infra/dto/participant.dto';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateGroupMemberDto = Record({
  groupMember: GroupMember,
  participant: Optional(ParticipantDto.Or(Null)),
  groupMemberSource: Optional(GroupMemberSource.Or(Null)),
});

export type UpdateGroupMemberDto = Static<typeof UpdateGroupMemberDto>;

/**
 * An alternative parser, instead of UpdateGroupMemberDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseUpdateGroupMemberDto = (
  dto: UpdateGroupMemberDto
): UpdateGroupMemberDto => {
  const { groupMember, participant, groupMemberSource } = dto;

  return {
    groupMember: parseGroupMember(groupMember),
    participant: participant ? ParticipantDto.check(participant) : undefined,
    groupMemberSource: groupMemberSource
      ? GroupMemberSource.check(groupMemberSource)
      : undefined,
  };
};
