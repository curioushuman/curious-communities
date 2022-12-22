import { Static } from 'runtypes';

import { createSlug, createYearMonth, Slug } from '@curioushuman/common';

import { GroupSource } from '../entities/group-source';

export const GroupSlug = Slug.withBrand('GroupSlug');

export type GroupSlug = Static<typeof GroupSlug>;

export const createGroupSlug = (source: GroupSource): Slug => {
  const yearMonthOpen = createYearMonth(source.dateOpen);
  return createSlug(`${yearMonthOpen}-${source.name}`);
};
