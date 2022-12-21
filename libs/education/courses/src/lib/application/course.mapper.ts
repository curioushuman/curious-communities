import { Course } from '../domain/entities/course';
import { CourseSource } from '../domain/entities/course-source';
import { createCourseSlug } from '../domain/value-objects/course-slug';
import config from '../static/config';
import { createYearMonth } from '@curioushuman/common';

/**
 * TODO
 * - Should we do more checking of CourseResponseDto?
 */
export class CourseMapper {
  public static fromSourceToCourse(source: CourseSource): Course {
    return Course.check({
      id: source.id,
      slug: createCourseSlug(source),
      status: source.status,
      supportType: config.defaults.courseSupportType,
      name: source.name,
      dateOpen: source.dateOpen,
      dateClosed: source.dateClosed,
      yearMonthOpen: createYearMonth(source.dateOpen),
      accountOwner: config.defaults.accountOwner,
    });
  }
}
