import {
  StandardGroupMemberBaseResponseDto,
  StandardGroupMemberResponseDto,
} from './dto/standard-group-member.response.dto';
import { StandardGroupMapper } from './standard-group.mapper';
import {
  StandardGroupMember,
  StandardGroupMemberBase,
} from '../domain/entities/standard-group-member';
import config from '../static/config';
import { MemberMapper } from './member.mapper';

export class StandardGroupMemberMapper {
  public static toResponseDto(
    groupMember: StandardGroupMember
  ): StandardGroupMemberResponseDto {
    const baseDto: StandardGroupMemberBaseResponseDto =
      StandardGroupMemberMapper.toBaseResponseDto(groupMember);
    const dto = {
      ...baseDto,
      group: StandardGroupMapper.toBaseResponseDto(groupMember.group),
      member: MemberMapper.toResponseDto(groupMember.member),
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
      member: MemberMapper.fromResponseDto(dto.member),
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
      accountOwner: dto.accountOwner,
    };
    return StandardGroupMemberBase.check(groupMember);
  }
}
