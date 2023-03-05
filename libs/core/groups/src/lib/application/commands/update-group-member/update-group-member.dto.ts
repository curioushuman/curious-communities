import { Null, Optional, Record, Static } from 'runtypes';
import {
  GroupMember,
  parseGroupMember,
} from '../../../domain/entities/group-member';
import { ParticipantDto } from '../../../infra/dto/participant.dto';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateGroupMemberDto = Record({
  groupMember: GroupMember,
  participant: Optional(ParticipantDto.Or(Null)),
  // NOT YET SUPPORTED
  // groupMemberSource: Optional(GroupMemberSource.Or(Null)),
});

export type UpdateGroupMemberDto = Static<typeof UpdateGroupMemberDto>;

/**
 * A type that represents the possible sources of update
 */
export type UpdateGroupMemberDtoSource = keyof Omit<
  UpdateGroupMemberDto,
  'groupMember'
>;

/**
 * A type the represents a function, that would update from a source
 */
export type UpdateGroupMemberDtoSourceFunction = (
  dto: UpdateGroupMemberDto
) => () => GroupMember;

/**
 * An alternative parser, instead of UpdateGroupMemberDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseUpdateGroupMemberDto = (
  dto: UpdateGroupMemberDto
): UpdateGroupMemberDto => {
  const { groupMember, participant } = dto;

  return {
    groupMember: parseGroupMember(groupMember),
    participant: participant ? ParticipantDto.check(participant) : undefined,
  };
};
