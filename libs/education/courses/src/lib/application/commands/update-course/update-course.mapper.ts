import { UpdateMapper } from '@curioushuman/common';

import { CourseSource } from '../../../domain/entities/course-source';
import { Course } from '../../../domain/entities/course';
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
    course: Course
  ): (source: CourseSource) => Course {
    return (source: CourseSource) => {
      const mappedCourse = CourseMapper.fromSourceToCourse(source);
      return Course.check({
        ...mappedCourse,
        id: course.id,
        slug: createCourseSlug(source),
      });
    };
  }
}
