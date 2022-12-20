import { Record, Static } from 'runtypes';

import { CourseId } from '../../domain/value-objects/course-id';

/**
 * This is the form of data we expect as input into our API/Request
 */

export const FindCourseSourceRequestDto = Record({
  id: CourseId,
});

export type FindCourseSourceRequestDto = Static<
  typeof FindCourseSourceRequestDto
>;
