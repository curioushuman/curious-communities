import { Record, Static } from 'runtypes';

import { CourseSource } from '../../../domain/entities/course-source';

/**
 * This is the form of data our repository will expect for the command
 *
 * It happens to re-use the CourseSourceIdSource type, but this is not
 * required. It is just a convenience.
 */

export const CreateCourseDto = Record({
  courseSource: CourseSource,
});

export type CreateCourseDto = Static<typeof CreateCourseDto>;
