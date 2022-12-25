import { Static } from 'runtypes';

import { createSlug, Slug } from '@curioushuman/common';

import { MemberSource } from '../entities/member-source';

export const MemberSlug = Slug.withBrand('MemberSlug');

export type MemberSlug = Static<typeof MemberSlug>;

export const createMemberSlug = (source: MemberSource): Slug => {
  return createSlug(source.name);
};
