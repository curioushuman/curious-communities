import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindGroupDto } from './find-group.dto';
import {
  FindByIdSourceValueGroupRequestDto,
  FindByIdGroupRequestDto,
  FindGroupRequestDto,
  FindBySlugGroupRequestDto,
} from '../../../infra/find-group/dto/find-group.request.dto';
import { GroupId } from '../../../domain/value-objects/group-id';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';
import { CreateGroupRequestDto } from '../../../infra/create-group/dto/create-group.request.dto';
import { GroupSlug } from '../../../domain/value-objects/group-slug';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupMapper {
  /**
   * As we use a similar construct when creating our groups,
   * we can share mapper functions.
   */
  public static fromFindRequestDto(
    dto: FindGroupRequestDto | CreateGroupRequestDto
  ): FindGroupDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    if ('id' in dto) {
      return FindGroupMapper.fromFindByIdRequestDto({
        id: dto.id as string,
      });
    }
    if ('idSourceValue' in dto) {
      return FindGroupMapper.fromFindByIdSourceValueRequestDto({
        idSourceValue: dto.idSourceValue as string,
      });
    }
    return FindGroupMapper.fromFindBySlugRequestDto({
      slug: dto.slug as string,
    });
  }

  public static fromFindByIdRequestDto(
    dto: FindByIdGroupRequestDto
  ): FindGroupDto {
    // this will throw an error if the id is not valid
    const value = GroupId.check(dto.id);
    return {
      identifier: 'id',
      value,
    } as FindGroupDto;
  }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueGroupRequestDto
  ): FindGroupDto {
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      GroupSourceId,
      Source
    );
    return {
      identifier: 'idSourceValue',
      value,
    } as FindGroupDto;
  }

  public static fromFindBySlugRequestDto(
    dto: FindBySlugGroupRequestDto
  ): FindGroupDto {
    // this will throw an error if the id is not valid
    const value = GroupSlug.check(dto.slug);
    return {
      identifier: 'slug',
      value,
    } as FindGroupDto;
  }
}
