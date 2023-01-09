import { GroupSourceResponseDto } from './dto/group-source.response.dto';
import { GroupSource } from '../domain/entities/group-source';

/**
 * TODO
 * - Should we do more checking of GroupSourceResponseDto?
 */
export class GroupSourceMapper {
  public static toResponseDto(
    groupSource: GroupSource
  ): GroupSourceResponseDto {
    return {
      id: groupSource.id,
      status: groupSource.status,
      name: groupSource.name,
    } as GroupSourceResponseDto;
  }
}
