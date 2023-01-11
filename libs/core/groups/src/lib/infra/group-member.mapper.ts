import { prepareExternalIdSourceValue } from '@curioushuman/common';

import {
  GroupMemberBaseResponseDto,
  GroupMemberResponseDto,
} from './dto/group-member.response.dto';
import {
  GroupMember,
  GroupMemberBase,
  prepareGroupMemberExternalIdSource,
} from '../domain/entities/group-member';
import { GroupMemberSourceIdSource } from '../domain/value-objects/group-member-source-id-source';
import { GroupMapper } from './group.mapper';

/**
 * TODO
 * - Should we do more checking of GroupMemberResponseDto?
 */
export class GroupMemberMapper {
  public static toResponseDtoIdSource(idSource: GroupMemberSourceIdSource) {
    return prepareExternalIdSourceValue(idSource.id, idSource.source);
  }

  public static toResponseDto(
    groupMember: GroupMember
  ): GroupMemberResponseDto {
    const baseDto: GroupMemberBaseResponseDto =
      GroupMemberMapper.toBaseResponseDto(groupMember);
    const dto = {
      ...baseDto,
      group: GroupMapper.toBaseResponseDto(groupMember.group),
    };
    return dto;
  }

  public static toBaseResponseDto(
    groupMember: GroupMember | GroupMemberBase
  ): GroupMemberBaseResponseDto {
    const dto: GroupMemberBaseResponseDto = {
      id: groupMember.id,
      memberId: groupMember.memberId,
      groupId: groupMember.groupId,
      status: groupMember.status,

      sourceIds: groupMember.sourceIds.map(
        GroupMemberMapper.toResponseDtoIdSource
      ),

      name: groupMember.name,
      email: groupMember.email,
      organisationName: groupMember.organisationName,

      accountOwner: groupMember.accountOwner,
    };
    return GroupMemberBaseResponseDto.check(dto);
  }

  public static fromResponseDto(dto: GroupMemberResponseDto): GroupMember {
    const base: GroupMemberBase = GroupMemberMapper.fromResponseDtoToBase(dto);
    const groupMember = {
      ...base,
      group: GroupMapper.fromResponseDtoToBase(dto.group),
    };
    return GroupMember.check(groupMember);
  }

  public static fromResponseDtoToBase(
    dto: GroupMemberResponseDto | GroupMemberBaseResponseDto
  ): GroupMemberBase {
    const groupMember = {
      id: dto.id,
      status: dto.status,
      memberId: dto.memberId,
      groupId: dto.groupId,

      sourceIds: dto.sourceIds.map(prepareGroupMemberExternalIdSource),

      name: dto.name,
      email: dto.email,
      organisationName: dto.organisationName,

      accountOwner: dto.accountOwner,
    };
    return GroupMemberBase.check(groupMember);
  }
}
