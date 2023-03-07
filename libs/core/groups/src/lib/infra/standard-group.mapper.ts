import { prepareExternalIdSourceValue } from '@curioushuman/common';

import {
  StandardGroupBaseResponseDto,
  StandardGroupResponseDto,
} from './dto/standard-group.response.dto';
import { prepareGroupExternalIdSource } from '../domain/entities/group';
import { StandardGroupMemberMapper } from './standard-group-member.mapper';
import { GroupSourceIdSource } from '../domain/value-objects/group-source-id-source';
import {
  StandardGroup,
  StandardGroupBase,
} from '../domain/entities/standard-group';
import config from '../static/config';

export class StandardGroupMapper {
  public static toResponseDtoIdSource(idSource: GroupSourceIdSource) {
    return prepareExternalIdSourceValue(idSource.id, idSource.source);
  }

  public static toResponseDto(group: StandardGroup): StandardGroupResponseDto {
    const dto: StandardGroupBaseResponseDto =
      StandardGroupMapper.toBaseResponseDto(group);
    return StandardGroupResponseDto.check({
      ...dto,
      groupMembers: group.groupMembers.map(
        StandardGroupMemberMapper.toBaseResponseDto
      ),
    });
  }

  public static toBaseResponseDto(
    group: StandardGroup | StandardGroupBase
  ): StandardGroupBaseResponseDto {
    const dto: StandardGroupBaseResponseDto = {
      _type: config.defaults.groupTypeStandard,
      id: group.id,
      sourceOrigin: group.sourceOrigin,
      sourceIds: group.sourceIds.map(StandardGroupMapper.toResponseDtoIdSource),

      slug: group.slug,
      status: group.status,
      name: group.name,
      accountOwner: group.accountOwner,
    };
    return StandardGroupBaseResponseDto.check(dto);
  }

  public static fromResponseDto(dto: StandardGroupResponseDto): StandardGroup {
    const base: StandardGroupBase =
      StandardGroupMapper.fromResponseDtoToBase(dto);
    const group = {
      ...base,
      groupMembers: dto.groupMembers.map((member) =>
        StandardGroupMemberMapper.fromResponseDtoToBase(member)
      ),
    };
    return StandardGroup.check(group);
  }

  public static fromResponseDtoToBase(
    dto: StandardGroupResponseDto | StandardGroupBaseResponseDto
  ): StandardGroupBase {
    const group = {
      _type: dto._type,
      id: dto.id,
      sourceOrigin: dto.sourceOrigin,
      sourceIds: dto.sourceIds.map(prepareGroupExternalIdSource),

      slug: dto.slug,
      status: dto.status,
      name: dto.name,
      accountOwner: dto.accountOwner,
    };
    return StandardGroupBase.check(group);
  }
}
