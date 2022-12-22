import { UpdateGroupDto } from './update-group.dto';
import { UpdateGroupRequestDto } from '../../../infra/update-group/dto/update-group.request.dto';
import { FindGroupSourceDto } from '../../queries/find-group-source/find-group-source.dto';
import { FindGroupDto } from '../../queries/find-group/find-group.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateGroupMapper {
  public static fromRequestDto(dto: UpdateGroupRequestDto): UpdateGroupDto {
    return UpdateGroupDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupSourceDto(dto: UpdateGroupDto): FindGroupSourceDto {
    return FindGroupSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupDto(dto: UpdateGroupDto): FindGroupDto {
    return {
      identifier: 'id',
      value: dto.id,
    } as FindGroupDto;
  }
}
