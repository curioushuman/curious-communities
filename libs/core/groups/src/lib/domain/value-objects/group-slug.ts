import { Static } from 'runtypes';

import { createSlug, Slug } from '@curioushuman/common';

import { GroupName } from './group-name';

export const GroupSlug = Slug.withBrand('GroupSlug');

export type GroupSlug = Static<typeof GroupSlug>;

export const createGroupSlug = (name: GroupName): Slug => {
  return createSlug(name);
};
