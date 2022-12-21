import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const CourseSourceName = NotEmptyString.withBrand('CourseSourceName');

export type CourseSourceName = Static<typeof CourseSourceName>;
