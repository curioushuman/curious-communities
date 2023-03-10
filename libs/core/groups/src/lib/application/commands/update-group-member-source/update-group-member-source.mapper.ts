import { UpdateMapper } from '@curioushuman/common';

import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { GroupMemberBase } from '../../../domain/entities/group-member';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { UpdateGroupMemberSourceDto } from './update-group-member-source.dto';
import { GroupMemberMapper } from '../../../infra/group-member.mapper';

export class UpdateGroupMemberSourceMapper extends UpdateMapper {
  public static fromUpsertRequestDto(
    groupMemberSource: GroupMemberSource
  ): (dto: UpsertGroupMemberSourceRequestDto) => UpdateGroupMemberSourceDto {
    return (dto: UpsertGroupMemberSourceRequestDto) => ({
      groupMember: GroupMemberMapper.fromResponseDto(dto.groupMember),
      groupMemberSource,
    });
  }

  public static fromGroupMemberToSource(
    groupMemberSource: GroupMemberSource
  ): (groupMember: GroupMemberBase) => GroupMemberSource {
    return (groupMember: GroupMemberBase) =>
      GroupMemberSource.check({
        groupId: groupMemberSource.groupId,
        memberId: groupMemberSource.memberId,
        memberEmail: groupMemberSource.memberEmail,
        source: groupMemberSource.source,
        // TODO: add status mapping, from group member to group member source
        status: groupMember.status,
      });
  }
}
