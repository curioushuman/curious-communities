import { CourseResponseDto } from './dto/course.response.dto';
import { Course } from '../domain/entities/course';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class CoursesMapper {
  public static toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      status: course.status,
      slug: course.slug,
      supportType: course.supportType,
      name: course.name,
      dateOpen: course.dateOpen,
      dateClosed: course.dateClosed,
      yearMonthOpen: course.yearMonthOpen,
    } as CourseResponseDto;
  }
}
