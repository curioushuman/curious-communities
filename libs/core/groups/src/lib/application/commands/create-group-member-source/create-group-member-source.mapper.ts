import { GroupMemberSourceForCreate } from '../../../domain/entities/group-member-source';
import { GroupMember } from '../../../domain/entities/group-member';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { CreateGroupMemberSourceDto } from './create-group-member-source.dto';
import { GroupMemberMapper } from '../../../infra/group-member.mapper';
import { GroupSource } from '../../../domain/entities/group-source';
import { findSourceId } from '@curioushuman/common';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';

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
      const memberSourceIdSource = findSourceId(
        groupMember.member.sourceIds,
        groupSource.source
      );
      if (!memberSourceIdSource) {
        throw new InternalRequestInvalidError(
          `Member ${groupMember.member.id} does not exist at source: ${groupSource.source}`
        );
      }
      return GroupMemberSourceForCreate.check({
        source: groupSource.source,
        groupId: groupSource.id,
        memberId: memberSourceIdSource.id,
        memberEmail: groupMember.member.email,
        // TODO: add status mapping, from group member to group member source
        status: groupMember.status,
      });
    };
  }
}
