import { CourseGroupResponseDto } from './dto/course-group.response.dto';
import { CourseGroup } from '../domain/entities/course-group';
import { GroupMapper } from './group.mapper';

/**
 * TODO
 * - Should we do more checking of CourseGroupResponseDto?
 */
export class CourseGroupMapper {
  public static toResponseDto(group: CourseGroup): CourseGroupResponseDto {
    const groupResponseDto = GroupMapper.toResponseDto(group);
    return CourseGroupResponseDto.check({
      ...groupResponseDto,
      courseId: group.courseId,
    });
  }

  public static fromResponseDto(dto: CourseGroupResponseDto): CourseGroup {
    const group = GroupMapper.fromResponseDto(dto);
    return CourseGroup.check({
      ...group,
      courseId: dto.courseId,
    });
  }
}
