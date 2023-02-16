import { GroupMemberSourceResponseDto } from './dto/group-member-source.response.dto';
import { GroupMemberSource } from '../domain/entities/group-member-source';

export class GroupMemberSourceMapper {
  public static toResponseDto(
    groupMemberSource: GroupMemberSource
  ): GroupMemberSourceResponseDto {
    return GroupMemberSourceResponseDto.check({
      source: groupMemberSource.source,
      groupId: groupMemberSource.groupId,
      memberId: groupMemberSource.memberId,
      memberEmail: groupMemberSource.memberEmail,
      status: groupMemberSource.status,
    });
  }

  public static fromResponseDto(
    dto: GroupMemberSourceResponseDto
  ): GroupMemberSource {
    return GroupMemberSource.check({
      source: dto.source,
      groupId: dto.groupId,
      memberId: dto.memberId,
      memberEmail: dto.memberEmail,
      status: dto.status,
    });
  }
}
