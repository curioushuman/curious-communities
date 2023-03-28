import { UpdateCourseMultiRequestDto } from '../../../infra/update-course-multi/dto/update-course-multi.request.dto';
import { FindCoursesDto } from './find-courses.dto';

export class FindCoursesMapper {
  /**
   * TODO:
   * - [ ] support multiple filters (dynamically)
   */
  public static fromUpdateCourseMultiRequestDto(
    dto: UpdateCourseMultiRequestDto
  ): FindCoursesDto {
    return FindCoursesDto.check({
      filters: {
        dateOpenRange: dto.dateOpenRange,
        status: dto.status,
      },
    });
  }
}
