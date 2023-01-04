import { Static } from 'runtypes';

import { CourseSourceIdSource } from '../../../domain/value-objects/course-source-id-source';

/**
 * This is the form of data our repository will expect for the command
 *
 * It happens to re-use the CourseSourceIdSource type, but this is not
 * required. It is just a convenience.
 */

export const CreateCourseDto =
  CourseSourceIdSource.withBrand('CreateCourseDto');

export type CreateCourseDto = Static<typeof CreateCourseDto>;
