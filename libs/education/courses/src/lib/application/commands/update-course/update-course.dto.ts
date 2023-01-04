import { Static } from 'runtypes';
import { CourseSourceIdSource } from '../../../domain/value-objects/course-source-id-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateCourseDto =
  CourseSourceIdSource.withBrand('UpdateCourseDto');

export type UpdateCourseDto = Static<typeof UpdateCourseDto>;
