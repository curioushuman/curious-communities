import { GroupSourceForCreate } from '../../../domain/entities/group-source';
import { Group } from '../../../domain/entities/group';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { CreateGroupSourceDto } from './create-group-source.dto';
import { GroupMapper } from '../../../infra/group.mapper';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateGroupSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertGroupSourceRequestDto
  ): CreateGroupSourceDto {
    return {
      source: Source.check(dto.source),
      group: GroupMapper.fromResponseDto(dto.group),
    };
  }

  public static fromGroupToSource(group: Group): GroupSourceForCreate {
    return GroupSourceForCreate.check({
      status: group.status,
      name: group.name,
    });
  }
}
