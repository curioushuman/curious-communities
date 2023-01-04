import { Record, Static } from 'runtypes';

import { CourseSourceId } from '../../../domain/value-objects/course-source-id';

export const FindCourseSourceDto = Record({
  id: CourseSourceId,
});

export type FindCourseSourceDto = Static<typeof FindCourseSourceDto>;
