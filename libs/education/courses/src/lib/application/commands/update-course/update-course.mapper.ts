import { UpdateMapper } from '@curioushuman/common';

import { CourseSource } from '../../../domain/entities/course-source';
import { CourseBase } from '../../../domain/entities/course';
import { createCourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseMapper as DomainCourseMapper } from '../../../domain/mappers/course.mapper';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';
import { UpdateCourseDto } from './update-course.dto';
import { CourseMapper as InfraCourseMapper } from '../../../infra/course.mapper';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateCourseMapper extends UpdateMapper {
  public static fromUpdateCourseRequestDto(
    dto: UpdateCourseRequestDto
  ): UpdateCourseDto {
    return {
      course: InfraCourseMapper.fromResponseDtoToBase(dto.course),
    };
  }

  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing course, and the source that will be overriding it
   */
  public static fromSourceToCourse(
    course: CourseBase
  ): (source: CourseSource) => CourseBase {
    return (source: CourseSource) => {
      const mappedCourseBase =
        DomainCourseMapper.fromSourceToCourseBase(source);
      return CourseBase.check({
        ...mappedCourseBase,
        id: course.id,
        slug: createCourseSlug(source),
      });
    };
  }
}
