import { Optional, Record, Static } from 'runtypes';

import {
  createSlug,
  createYearMonth,
  PositiveInteger,
  Slug,
  Timestamp,
  YearMonth,
} from '@curioushuman/common';

import { CourseName } from '../value-objects/course-name';
import { CourseDetails } from '../value-objects/course-details';
import { CourseId } from '../value-objects/course-id';
import { CourseSource } from './course-source';

/**
 * Runtypes constant for the (internal) Course entity
 * Used for type checking and validation
 */
export const Course = Record({
  id: CourseId,
  slug: Slug,
  name: CourseName,
  details: Optional(CourseDetails),
  dateTrackMinimum: Timestamp,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
  yearMonthOpen: YearMonth,
  countEntries: PositiveInteger,
  countEntriesUnmoderated: PositiveInteger,
  countEntriesModerated: PositiveInteger,
  countResultsLongList: PositiveInteger,
  countResultsShortList: PositiveInteger,
  countResultsFinalists: PositiveInteger,
  countResultsWinners: PositiveInteger,
});

/**
 * Type for the (internal) course entity
 */
export type Course = Static<typeof Course>;

export const createCourseSlug = (source: CourseSource): Slug => {
  const yearMonthOpen = createYearMonth(source.dateOpen);
  return createSlug(`${yearMonthOpen}-${source.name}`);
};

/**
 * Type that defines all the possible identifiers for a course
 * NOTE: this is utilized in find-course.dto.ts and course.repository.ts
 * to define parsers and finders.
 */
export type CourseIdentifiers = {
  id: CourseId;
  slug: Slug;
};
export type CourseIdentifier = keyof CourseIdentifiers;
