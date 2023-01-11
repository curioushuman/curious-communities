import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { GroupMember } from '../../../domain/entities/group-member';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { UpdateGroupMemberSourceDto } from './update-group-member-source.dto';
import { GroupMemberMapper } from '../../../infra/group-member.mapper';

/**
 * TODO
 * - update base abstract class for mappers
 */
export class UpdateGroupMemberSourceMapper {
  public static fromUpsertRequestDto(
    groupMemberSource: GroupMemberSource
  ): (dto: UpsertGroupMemberSourceRequestDto) => UpdateGroupMemberSourceDto {
    return (dto: UpsertGroupMemberSourceRequestDto) =>
      UpdateGroupMemberSourceDto.check({
        source: dto.source,
        groupMember: GroupMemberMapper.fromResponseDto(dto.groupMember),
        groupMemberSource,
      });
  }

  public static fromGroupMemberToSource(
    groupMemberSource: GroupMemberSource
  ): (groupMember: GroupMember) => GroupMemberSource {
    return (groupMember: GroupMember) =>
      GroupMemberSource.check({
        ...groupMemberSource,
        status: groupMember.status,
        name: groupMember.name,
        email: groupMember.email,
        organisationName: groupMember.organisationName,
      });
  }
}
