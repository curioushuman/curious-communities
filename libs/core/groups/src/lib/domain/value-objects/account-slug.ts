import { Static } from 'runtypes';

import { Slug } from '@curioushuman/common';

export const AccountSlug = Slug.withBrand('AccountSlug');

export type AccountSlug = Static<typeof AccountSlug>;
