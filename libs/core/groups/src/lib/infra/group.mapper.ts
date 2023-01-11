import { prepareExternalIdSourceValue } from '@curioushuman/common';

import {
  GroupBaseResponseDto,
  GroupResponseDto,
} from './dto/group.response.dto';
import {
  Group,
  GroupBase,
  prepareGroupExternalIdSource,
} from '../domain/entities/group';
import { GroupMemberMapper } from './group-member.mapper';
import { GroupSourceIdSource } from '../domain/value-objects/group-source-id-source';

/**
 * TODO
 * - Should we do more checking of GroupResponseDto?
 */
export class GroupMapper {
  public static toResponseDtoIdSource(idSource: GroupSourceIdSource) {
    return prepareExternalIdSourceValue(idSource.id, idSource.source);
  }

  public static toResponseDto(group: Group): GroupResponseDto {
    const dto: GroupBaseResponseDto = GroupMapper.toBaseResponseDto(group);
    return GroupResponseDto.check({
      ...dto,
      members: group.members.map(GroupMemberMapper.toBaseResponseDto),
    });
  }

  public static toBaseResponseDto(
    group: Group | GroupBase
  ): GroupBaseResponseDto {
    const dto: GroupBaseResponseDto = {
      id: group.id,
      status: group.status,
      type: group.type,
      slug: group.slug,

      sourceIds: group.sourceIds.map(GroupMapper.toResponseDtoIdSource),

      name: group.name,

      accountOwner: group.accountOwner,
    };
    return GroupBaseResponseDto.check(dto);
  }

  public static fromResponseDto(dto: GroupResponseDto): Group {
    const base: GroupBase = GroupMapper.fromResponseDtoToBase(dto);
    const group = {
      ...base,
      members: dto.members.map((member) =>
        GroupMemberMapper.fromResponseDtoToBase(member)
      ),
    };
    return Group.check(group);
  }

  public static fromResponseDtoToBase(
    dto: GroupResponseDto | GroupBaseResponseDto
  ): GroupBase {
    const group = {
      id: dto.id,
      status: dto.status,
      type: dto.type,
      slug: dto.slug,

      sourceIds: dto.sourceIds.map(prepareGroupExternalIdSource),

      name: dto.name,

      accountOwner: dto.accountOwner,
    };
    return GroupBase.check(group);
  }
}
