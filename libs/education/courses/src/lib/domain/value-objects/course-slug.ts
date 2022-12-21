import { Static } from 'runtypes';

import { createSlug, createYearMonth, Slug } from '@curioushuman/common';

import { CourseSource } from '../entities/course-source';

export const CourseSlug = Slug.withBrand('CourseSlug');

export type CourseSlug = Static<typeof CourseSlug>;

export const createCourseSlug = (source: CourseSource): Slug => {
  const yearMonthOpen = createYearMonth(source.dateOpen);
  return createSlug(`${yearMonthOpen}-${source.name}`);
};
