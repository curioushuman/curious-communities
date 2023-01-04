import { Static } from 'runtypes';

import { InternalId } from '@curioushuman/common';

export const CourseId = InternalId.withBrand('CourseId');

export type CourseId = Static<typeof CourseId>;
