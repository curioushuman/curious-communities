import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const CourseId = ExternalId.withBrand('CourseId');

export type CourseId = Static<typeof CourseId>;
