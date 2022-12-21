import { Record, Static } from 'runtypes';

import { CourseId } from '../../../domain/value-objects/course-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateCourseDto = Record({
  id: CourseId,
});

export type UpdateCourseDto = Static<typeof UpdateCourseDto>;
