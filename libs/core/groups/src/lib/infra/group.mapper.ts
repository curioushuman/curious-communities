import { StandardGroupMapper } from './standard-group.mapper';
import { GroupBaseResponseDto } from './dto/group.response.dto';
import { GroupBase } from '../domain/entities/group';
import { CourseGroupMapper } from './course-group.mapper';
import { isCourseGroupBaseResponseDto } from './dto/course-group.response.dto';

export class GroupMapper {
  public static fromResponseDtoToBase(dto: GroupBaseResponseDto): GroupBase {
    return isCourseGroupBaseResponseDto(dto)
      ? CourseGroupMapper.fromResponseDtoToBase(dto)
      : StandardGroupMapper.fromResponseDtoToBase(dto);
  }
}
