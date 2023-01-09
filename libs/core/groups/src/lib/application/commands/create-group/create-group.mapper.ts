import { CreateGroupDto } from './create-group.dto';
import { CreateGroupRequestDto } from '../../../infra/create-group/dto/create-group.request.dto';
import { GroupSource } from '../../../domain/entities/group-source';
import { Group } from '../../../domain/entities/group';
import { createGroupId } from '../../../domain/value-objects/group-id';
import config from '../../../static/config';
import { FindGroupMapper } from '../../queries/find-group/find-group.mapper';
import { FindGroupSourceMapper } from '../../queries/find-group-source/find-group-source.mapper';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateGroupMapper {
  public static fromRequestDto(dto: CreateGroupRequestDto): CreateGroupDto {
    // NOTE: the DTO values are validated in these other mappers
    const findGroupDto = FindGroupMapper.fromFindRequestDto(dto);
    const findGroupSourceDto = FindGroupSourceMapper.fromFindRequestDto(dto);
    return {
      findGroupDto,
      findGroupSourceDto,
    };
  }

  public static fromSourceToGroup(source: GroupSource): Group {
    return Group.check({
      id: createGroupId(),
      status: source.status,
      type: config.defaults.groupType,
      slug: createGroupSlug(source.name),

      sourceIds: [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ],

      name: source.name,

      accountOwner: config.defaults.accountOwner,
    });
  }
}
