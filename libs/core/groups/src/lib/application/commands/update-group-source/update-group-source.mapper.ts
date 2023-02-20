import { UpdateMapper } from '@curioushuman/common';

import { GroupSource } from '../../../domain/entities/group-source';
import { GroupBase } from '../../../domain/entities/group';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { UpdateGroupSourceDto } from './update-group-source.dto';
import { GroupMapper } from '../../../infra/group.mapper';

export class UpdateGroupSourceMapper extends UpdateMapper {
  public static fromUpsertRequestDto(
    groupSource: GroupSource
  ): (dto: UpsertGroupSourceRequestDto) => UpdateGroupSourceDto {
    return (dto: UpsertGroupSourceRequestDto) => ({
      group: GroupMapper.fromResponseDtoToBase(dto.group),
      groupSource,
    });
  }

  public static fromGroupToSource(
    groupSource: GroupSource
  ): (group: GroupBase) => GroupSource {
    return (group: GroupBase) =>
      GroupSource.check({
        id: groupSource.id,
        source: groupSource.source,
        // TODO: add status mapping, from group to group source
        status: group.status,
        name: group.name,
        slug: group.slug,
      });
  }
}
