import { createYearMonth } from '@curioushuman/common';
import config from '../../static/config';
import { CourseBase } from '../entities/course';
import { CourseSource } from '../entities/course-source';
import { AccountSlug } from '../value-objects/account-slug';
import { CourseName } from '../value-objects/course-name';
import { CourseStatus } from '../value-objects/course-status';

/**
 * This is the main mapper for course entity, containing any shared logic
 *
 * There are also specific mappers for contexts such as
 * - creating a course
 * - updating a course
 * - converting to response DTO
 *
 * NOTE:
 * - we're type casting here because we know the complete object will be
 *   checked in the calling function
 * - at some point you may need to include a status mapping function
 */
export class CourseMapper {
  public static fromSourceToCourseBase(
    source: CourseSource
  ): Omit<CourseBase, 'id' | 'slug'> {
    return {
      status: source.status as CourseStatus,

      sourceIds: [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ],

      supportType: config.defaults.courseSupportType,
      name: CourseName.check(source.name),
      dateOpen: source.dateOpen,
      dateClosed: source.dateClosed,
      yearMonthOpen: source.dateOpen
        ? createYearMonth(source.dateOpen)
        : undefined,

      accountOwner: config.defaults.accountOwner as AccountSlug,
    };
  }
}
