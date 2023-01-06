import { CourseResponseDto } from './dto/course.response.dto';
import { Course } from '../domain/entities/course';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class CourseMapper {
  public static toResponseDto(course: Course): CourseResponseDto {
    return {
      id: course.id,
      status: course.status,
      slug: course.slug,

      sourceIds: course.sourceIds.map((idSource) =>
        prepareExternalIdSourceValue(idSource.id, idSource.source)
      ),

      supportType: course.supportType,
      name: course.name,
      dateOpen: course.dateOpen,
      dateClosed: course.dateClosed,
      yearMonthOpen: course.yearMonthOpen,
    } as CourseResponseDto;
  }
}
