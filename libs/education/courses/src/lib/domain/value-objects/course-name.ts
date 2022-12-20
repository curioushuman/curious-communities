import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const CourseName = NotEmptyString.withBrand('CourseName');

export type CourseName = Static<typeof CourseName>;
