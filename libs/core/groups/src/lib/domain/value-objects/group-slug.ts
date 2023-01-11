import { Static } from 'runtypes';

import { createSlug, Slug } from '@curioushuman/common';

export const GroupSlug = Slug.withBrand('GroupSlug');

export type GroupSlug = Static<typeof GroupSlug>;

export const createGroupSlug = (name: string): Slug => {
  return createSlug(name);
};
