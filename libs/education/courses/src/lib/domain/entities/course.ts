import { Record, Static } from 'runtypes';

import { Timestamp, YearMonth } from '@curioushuman/common';

import { CourseName } from '../value-objects/course-name';
import { CourseId } from '../value-objects/course-id';
import { CourseStatus } from '../value-objects/course-status';
import { CourseSupportType } from '../value-objects/course-support-type';
import { AccountSlug } from '../value-objects/account-slug';
import { CourseSlug } from '../value-objects/course-slug';

/**
 * Runtypes constant for the (internal) Course entity
 * Used for type checking and validation
 */
export const Course = Record({
  id: CourseId,
  slug: CourseSlug,
  status: CourseStatus,
  supportType: CourseSupportType,
  name: CourseName,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
  yearMonthOpen: YearMonth,
  // e.g. APF being the account that owns this course
  accountOwner: AccountSlug,
});

/**
 * Type for the (internal) course entity
 */
export type Course = Static<typeof Course>;

/**
 * Type that defines all the possible identifiers for a course
 * NOTE: this is utilized in find-course.dto.ts and course.repository.ts
 * to define parsers and finders.
 */
export type CourseIdentifiers = {
  id: CourseId;
  slug: CourseSlug;
};
export type CourseIdentifier = keyof CourseIdentifiers;
