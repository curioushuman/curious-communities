import { Array, Optional, Record, Static } from 'runtypes';

import {
  prepareExternalIdSource,
  Timestamp,
  YearMonth,
} from '@curioushuman/common';

import { CourseId } from '../value-objects/course-id';
import { CourseStatus } from '../value-objects/course-status';
import { AccountSlug } from '../value-objects/account-slug';
import { CourseName } from '../value-objects/course-name';
import {
  CourseSourceIdSource,
  CourseSourceIdSourceValue,
} from '../value-objects/course-source-id-source';
import { CourseSourceId } from '../value-objects/course-source-id';
import { Source } from '../value-objects/source';
import { CourseSlug } from '../value-objects/course-slug';
import { ParticipantBase } from './participant';
import { CourseSupportType } from '../value-objects/course-support-type';

/**
 * Base type for internal course entity
 *
 * i.e. just the fields
 */
export const CourseBase = Record({
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
 * Base type for internal course entity
 *
 * i.e. just the fields
 */
export type CourseBase = Static<typeof CourseBase>;

/**
 * Type for internal course entity
 *
 * i.e. fields + relationships
 *
 * * NOTE: I've had to duplicate this extension over at CourseCourse
 */
export const Course = CourseBase.extend({
  participants: Array(ParticipantBase),
});

/**
 * Type for internal course entity
 *
 * i.e. fields + relationships
 */
export type Course = Static<typeof Course>;

/**
 * Type that defines all the possible identifiers for a course
 * NOTE: this is utilized in find-course.dto.ts and course.repository.ts
 * to define parsers and finders.
 */
export interface CourseIdentifiers {
  id: CourseId;
  idSourceValue: CourseSourceIdSourceValue;
  slug: CourseSlug;
}
export type CourseIdentifier = keyof CourseIdentifiers;

/**
 * Convenience function to prepare a CourseSourceIdSource
 */
export function prepareCourseExternalIdSource(
  idSourceValue: string
): CourseSourceIdSource {
  return prepareExternalIdSource(idSourceValue, CourseSourceId, Source);
}
