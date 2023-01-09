import { prepareExternalIdSourceValue } from '@curioushuman/common';

import { GroupResponseDto } from './dto/group.response.dto';
import { Group, prepareGroupExternalIdSource } from '../domain/entities/group';

/**
 * TODO
 * - Should we do more checking of GroupResponseDto?
 */
export class GroupMapper {
  public static toResponseDto(group: Group): GroupResponseDto {
    return GroupResponseDto.check({
      id: group.id,
      status: group.status,
      type: group.type,
      slug: group.slug,

      sourceIds: group.sourceIds.map((idSource) =>
        prepareExternalIdSourceValue(idSource.id, idSource.source)
      ),

      name: group.name,

      accountOwner: group.accountOwner,
    });
  }

  public static fromResponseDto(dto: GroupResponseDto): Group {
    return Group.check({
      id: dto.id,
      status: dto.status,
      type: dto.type,
      slug: dto.slug,

      sourceIds: dto.sourceIds.map((idSourceValue) =>
        prepareGroupExternalIdSource(idSourceValue)
      ),

      name: dto.name,

      accountOwner: dto.accountOwner,
    });
  }
}
