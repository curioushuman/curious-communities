import { UpdateGroupDto } from './update-group.dto';
import { UpdateGroupRequestDto } from '../../../infra/update-group/dto/update-group.request.dto';
import { FindGroupSourceDto } from '../../queries/find-group-source/find-group-source.dto';
import { FindGroupDto } from '../../queries/find-group/find-group.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { GroupSource } from '../../../domain/entities/group-source';
import {
  Group,
  prepareGroupExternalIdSource,
} from '../../../domain/entities/group';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateGroupMapper {
  public static fromRequestDto(dto: UpdateGroupRequestDto): UpdateGroupDto {
    const idSource = prepareGroupExternalIdSource(dto.idSourceValue);
    return UpdateGroupDto.check(idSource);
  }

  public static toFindGroupSourceDto(dto: UpdateGroupDto): FindGroupSourceDto {
    // by the time it gets to here, it's been validated already
    return {
      identifier: 'idSource',
      value: dto,
    };
  }

  public static toFindGroupDto(dto: UpdateGroupDto): FindGroupDto {
    return {
      identifier: 'idSourceValue',
      value: prepareExternalIdSourceValue(dto.id, dto.source),
    } as FindGroupDto;
  }

  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing group, and the source that will be overriding it
   *
   * NOTE: we do NOT update everything from the source
   */
  public static fromSourceToGroup(
    group: Group
  ): (source: GroupSource) => Group {
    return (source: GroupSource) => {
      return Group.check({
        ...group,
        status: source.status,
        name: source.name,
      });
    };
  }
}
