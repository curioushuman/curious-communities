import { GroupSource } from '../../../domain/entities/group-source';
import { Group } from '../../../domain/entities/group';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { UpdateGroupSourceDto } from './update-group-source.dto';
import { GroupMapper } from '../../../infra/group.mapper';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - update base abstract class for mappers
 */
export class UpdateGroupSourceMapper {
  public static fromUpsertRequestDto(
    groupSource: GroupSource
  ): (dto: UpsertGroupSourceRequestDto) => UpdateGroupSourceDto {
    return (dto: UpsertGroupSourceRequestDto) => ({
      source: Source.check(dto.source),
      group: GroupMapper.fromResponseDto(dto.group),
      groupSource,
    });
  }

  public static fromGroupToSource(
    groupSource: GroupSource
  ): (group: Group) => GroupSource {
    return (group: Group) => ({
      id: groupSource.id,
      status: group.status,
      name: group.name,
    });
  }
}
