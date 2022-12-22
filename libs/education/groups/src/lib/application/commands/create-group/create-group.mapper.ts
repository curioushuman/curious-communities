import { CreateGroupDto } from './create-group.dto';
import { CreateGroupRequestDto } from '../../../infra/create-group/dto/create-group.request.dto';
import { FindGroupSourceDto } from '../../queries/find-group-source/find-group-source.dto';
import { FindGroupDto } from '../../queries/find-group/find-group.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateGroupMapper {
  public static fromRequestDto(dto: CreateGroupRequestDto): CreateGroupDto {
    return CreateGroupDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupSourceDto(dto: CreateGroupDto): FindGroupSourceDto {
    return FindGroupSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupDto(dto: CreateGroupDto): FindGroupDto {
    return {
      identifier: 'id',
      value: dto.id,
    } as FindGroupDto;
  }
}
