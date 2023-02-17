import { Record, Static } from 'runtypes';
import {
  GroupMemberResponseDto,
  parseGroupMemberResponseDto,
} from '../../dto/group-member-response.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpdateGroupMemberRequestDto = Record({
  groupMember: GroupMemberResponseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpdateGroupMemberRequestDto = Static<
  typeof UpdateGroupMemberRequestDto
>;

/**
 * An alternative parser, instead of UpdateGroupMemberRequestDto.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseUpdateGroupMemberRequestDto = (
  dto: UpdateGroupMemberRequestDto
): UpdateGroupMemberRequestDto => {
  const { groupMember } = dto;
  return {
    groupMember: parseGroupMemberResponseDto(groupMember),
  };
};
