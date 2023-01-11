import { GroupMemberSourceForCreate } from '../../../domain/entities/group-member-source';
import { GroupMember } from '../../../domain/entities/group-member';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { CreateGroupMemberSourceDto } from './create-group-member-source.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateGroupMemberSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertGroupMemberSourceRequestDto
  ): CreateGroupMemberSourceDto {
    return CreateGroupMemberSourceDto.check({
      source: dto.source,
      groupMember: dto.groupMember,
    });
  }

  public static fromGroupMemberToSource(
    groupMember: GroupMember
  ): GroupMemberSourceForCreate {
    return GroupMemberSourceForCreate.check({
      // TODO: this actually needs to be the external ID
      groupId: groupMember.groupId,
      status: groupMember.status,
      name: groupMember.name,
      email: groupMember.email,
      organisationName: groupMember.organisationName,
    });
  }
}
