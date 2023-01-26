import { UpdateMapper } from '@curioushuman/common';

import { CourseSource } from '../../../domain/entities/course-source';
import { CourseBase } from '../../../domain/entities/course';
import { createCourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseMapper } from '../../../domain/mappers/course.mapper';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateCourseMapper extends UpdateMapper {
  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing course, and the source that will be overriding it
   */
  public static fromSourceToCourse(
    course: CourseBase
  ): (source: CourseSource) => CourseBase {
    return (source: CourseSource) => {
      const mappedCourseBase = CourseMapper.fromSourceToCourseBase(source);
      return CourseBase.check({
        ...mappedCourseBase,
        id: course.id,
        slug: createCourseSlug(source),
      });
    };
  }
}
