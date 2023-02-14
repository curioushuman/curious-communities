import { GroupMemberSourceForCreate } from '../../../domain/entities/group-member-source';
import { GroupMember } from '../../../domain/entities/group-member';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { CreateGroupMemberSourceDto } from './create-group-member-source.dto';
import { GroupMemberMapper } from '../../../infra/group-member.mapper';
import { GroupSource } from '../../../domain/entities/group-source';

export class CreateGroupMemberSourceMapper {
  public static fromUpsertRequestDto(
    groupSource: GroupSource
  ): (dto: UpsertGroupMemberSourceRequestDto) => CreateGroupMemberSourceDto {
    return (dto: UpsertGroupMemberSourceRequestDto) => ({
      groupSource,
      groupMember: GroupMemberMapper.fromResponseDto(dto.groupMember),
    });
  }

  public static fromGroupMemberToSource(
    groupSource: GroupSource
  ): (groupMember: GroupMember) => GroupMemberSourceForCreate {
    return (groupMember: GroupMember) => {
      return GroupMemberSourceForCreate.check({
        groupId: groupSource.id,
        status: groupMember.status,
        name: groupMember.name,
        email: groupMember.email,
        organisationName: groupMember.organisationName,
      });
    };
  }
}
