import { GroupSourceForCreate } from '../../../domain/entities/group-source';
import { GroupBase } from '../../../domain/entities/group';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { CreateGroupSourceDto } from './create-group-source.dto';
import { GroupMapper } from '../../../infra/group.mapper ';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateGroupSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertGroupSourceRequestDto
  ): CreateGroupSourceDto {
    return {
      group: GroupMapper.fromResponseDtoToBase(dto.group),
    };
  }

  public static fromGroupToSource(group: GroupBase): GroupSourceForCreate {
    return GroupSourceForCreate.check({
      status: group.status,
      name: group.name,
      slug: group.slug,
    });
  }
}
