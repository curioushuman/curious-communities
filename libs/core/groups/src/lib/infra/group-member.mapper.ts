import { GroupMemberResponseDto } from './dto/group-member.response.dto';
import { GroupMember } from '../domain/entities/group-member';

/**
 * TODO
 * - Should we do more checking of GroupMemberResponseDto?
 */
export class GroupMemberMapper {
  public static toResponseDto(
    groupMember: GroupMember
  ): GroupMemberResponseDto {
    return {
      id: groupMember.id,
      memberId: groupMember.memberId,
      groupId: groupMember.groupId,
      status: groupMember.status,
      memberName: groupMember.memberName,
      memberEmail: groupMember.memberEmail,
      memberOrganisationName: groupMember.memberOrganisationName,
    } as GroupMemberResponseDto;
  }
}
