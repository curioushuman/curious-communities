import { GroupMemberSourceResponseDto } from './dto/group-member-source.response.dto';
import { GroupMemberSource } from '../domain/entities/group-member-source';

export class GroupMemberSourceMapper {
  public static toResponseDto(
    groupMemberSource: GroupMemberSource
  ): GroupMemberSourceResponseDto {
    return GroupMemberSourceResponseDto.check({
      id: groupMemberSource.id,
      source: groupMemberSource.source,
      groupId: groupMemberSource.groupId,
      status: groupMemberSource.status,

      name: groupMemberSource.name,
      email: groupMemberSource.email,
      organisationName: groupMemberSource.organisationName,
    });
  }

  public static fromResponseDto(
    dto: GroupMemberSourceResponseDto
  ): GroupMemberSource {
    return GroupMemberSource.check({
      id: dto.id,
      groupId: dto.groupId,
      status: dto.status,

      name: dto.name,
      email: dto.email,
      organisationName: dto.organisationName,
    });
  }
}
