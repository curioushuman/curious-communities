import { Optional, Record, Static } from 'runtypes';
import { GroupMemberResponseDto } from '../../dto/group-member.response.dto';
import { GroupBaseResponseDto } from '../../dto/group.response.dto';
import { MemberDto } from '../../dto/member.dto';

/**
 * Externally facing DTO for update members of group
 */
export const UpdateGroupMemberMultiRequestDto = Record({
  groupMember: Optional(GroupMemberResponseDto),
  group: Optional(GroupBaseResponseDto),
  member: Optional(MemberDto),
}).withConstraint((dto) => !!(dto.group || dto.member));

export type UpdateGroupMemberMultiRequestDto = Static<
  typeof UpdateGroupMemberMultiRequestDto
>;
