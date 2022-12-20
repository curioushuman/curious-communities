import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const FindCourseSourceDto = Record({
  id: ExternalId,
});

export type FindCourseSourceDto = Static<typeof FindCourseSourceDto>;
