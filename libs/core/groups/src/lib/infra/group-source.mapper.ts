import { GroupSourceResponseDto } from './dto/group-source.response.dto';
import { GroupSource } from '../domain/entities/group-source';

export class GroupSourceMapper {
  public static toResponseDto(
    groupSource: GroupSource
  ): GroupSourceResponseDto {
    return {
      id: groupSource.id,
      source: groupSource.source,
      status: groupSource.status,
      name: groupSource.name,
    } as GroupSourceResponseDto;
  }
}
