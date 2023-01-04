import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const CourseSourceId = ExternalId.withBrand('CourseSourceId');

export type CourseSourceId = Static<typeof CourseSourceId>;
