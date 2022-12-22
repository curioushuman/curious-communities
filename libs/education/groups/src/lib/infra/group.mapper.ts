import { GroupResponseDto } from './dto/group.response.dto';
import { Group } from '../domain/entities/group';

/**
 * TODO
 * - Should we do more checking of GroupResponseDto?
 */
export class GroupMapper {
  public static toResponseDto(group: Group): GroupResponseDto {
    return {
      id: group.id,
      status: group.status,
      slug: group.slug,
      supportType: group.supportType,
      name: group.name,
      dateOpen: group.dateOpen,
      dateClosed: group.dateClosed,
      yearMonthOpen: group.yearMonthOpen,
    } as GroupResponseDto;
  }
}
