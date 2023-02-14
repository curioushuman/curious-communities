import { prepareExternalIdSourceValue } from '@curioushuman/common';

import {
  StandardGroupMemberBaseResponseDto,
  StandardGroupMemberResponseDto,
} from './dto/standard-group-member.response.dto';
import { prepareGroupMemberExternalIdSource } from '../domain/entities/group-member';
import { GroupMemberSourceIdSource } from '../domain/value-objects/group-member-source-id-source';
import { StandardGroupMapper } from './standard-group.mapper';
import {
  StandardGroupMember,
  StandardGroupMemberBase,
} from '../domain/entities/standard-group-member';
import config from '../static/config';

export class StandardGroupMemberMapper {
  public static toResponseDtoIdSource(idSource: GroupMemberSourceIdSource) {
    return prepareExternalIdSourceValue(idSource.id, idSource.source);
  }

  public static toResponseDto(
    groupMember: StandardGroupMember
  ): StandardGroupMemberResponseDto {
    const baseDto: StandardGroupMemberBaseResponseDto =
      StandardGroupMemberMapper.toBaseResponseDto(groupMember);
    const dto = {
      ...baseDto,
      group: StandardGroupMapper.toBaseResponseDto(groupMember.group),
    };
    return dto;
  }

  public static toBaseResponseDto(
    groupMember: StandardGroupMember | StandardGroupMemberBase
  ): StandardGroupMemberBaseResponseDto {
    const dto: StandardGroupMemberBaseResponseDto = {
      _type: config.defaults.groupTypeStandard,
      id: groupMember.id,
      memberId: groupMember.memberId,
      groupId: groupMember.groupId,
      status: groupMember.status,

      sourceIds: groupMember.sourceIds.map(
        StandardGroupMemberMapper.toResponseDtoIdSource
      ),

      name: groupMember.name,
      email: groupMember.email,
      organisationName: groupMember.organisationName,

      accountOwner: groupMember.accountOwner,
    };
    return StandardGroupMemberBaseResponseDto.check(dto);
  }

  public static fromResponseDto(
    dto: StandardGroupMemberResponseDto
  ): StandardGroupMember {
    // NOTE: checking is done in the from... functions
    const base: StandardGroupMemberBase =
      StandardGroupMemberMapper.fromResponseDtoToBase(dto);
    return {
      ...base,
      group: StandardGroupMapper.fromResponseDtoToBase(dto.group),
    };
  }

  public static fromResponseDtoToBase(
    dto: StandardGroupMemberResponseDto | StandardGroupMemberBaseResponseDto
  ): StandardGroupMemberBase {
    const groupMember = {
      _type: dto._type,
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
    return StandardGroupMemberBase.check(groupMember);
  }
}
