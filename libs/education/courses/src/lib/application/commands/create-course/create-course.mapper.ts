import { CourseSource } from '../../../domain/entities/course-source';
import { CourseBase } from '../../../domain/entities/course';
import { createCourseId } from '../../../domain/value-objects/course-id';
import { createCourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseMapper } from '../../../domain/mappers/course.mapper';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCourseMapper {
  public static fromSourceToCourse(source: CourseSource): CourseBase {
    const courseBase = CourseMapper.fromSourceToCourseBase(source);
    return CourseBase.check({
      ...courseBase,
      id: createCourseId(),
      slug: createCourseSlug(source),
    });
  }
}
