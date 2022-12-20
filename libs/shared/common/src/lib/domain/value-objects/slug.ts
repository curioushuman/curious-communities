import { Static, String } from 'runtypes';
import * as slug from 'slug';

/**
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 *
 * TODO
 * - [ ] should this be more OO? e.g. createSlug
 */

export const SlugRegex = /^[0-9a-z-_]+$/;

export const Slug = String.withBrand('Slug').withConstraint(
  (maybeSlug) => SlugRegex.test(maybeSlug) || 'Invalid slug'
);

export type Slug = Static<typeof Slug>;

// slug, by default, will remove dodgy chars
// but not nums, so we need to add that
export const SlugRegexRemove = /[0-9]/g;

slug.defaults.mode = 'pretty';
slug.defaults.modes['pretty'] = {
  replacement: '-', // replace spaces with replacement
  symbols: true, // replace unicode symbols or not
  lower: true, // result in lower case
  remove: SlugRegexRemove, // characters to remove
  charmap: slug.charmap, // replace special characters
  multicharmap: slug.multicharmap, // replace multi-characters
};

export const createSlug = (text: string): Slug => {
  return Slug.check(slug(text));
};
