import { Array, Optional, Record, Static } from 'runtypes';

import { Timestamp, ValueOf, YearMonth } from '@curioushuman/common';

import { CourseName } from '../value-objects/course-name';
import { CourseStatus } from '../value-objects/course-status';
import { CourseSupportType } from '../value-objects/course-support-type';
import { AccountSlug } from '../value-objects/account-slug';
import { CourseSlug } from '../value-objects/course-slug';
import { CourseId } from '../value-objects/course-id';
import {
  CourseSourceIdSource,
  CourseSourceIdSourceValue,
} from '../value-objects/course-source-id-source';

/**
 * Runtypes constant for the (internal) Course entity
 * Used for type checking and validation
 */
export const Course = Record({
  id: CourseId,
  slug: CourseSlug,
  status: CourseStatus,

  sourceIds: Array(CourseSourceIdSource),

  supportType: CourseSupportType,
  name: CourseName,
  dateOpen: Optional(Timestamp),
  dateClosed: Optional(Timestamp),
  yearMonthOpen: Optional(YearMonth),
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
  idSourceValue: CourseSourceIdSourceValue;
  slug: CourseSlug;
};
export type CourseIdentifier = keyof CourseIdentifiers;
export type CourseIdentifierValue = ValueOf<CourseIdentifier>;
