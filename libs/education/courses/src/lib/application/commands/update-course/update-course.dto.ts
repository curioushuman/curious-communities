import { Record, Static } from 'runtypes';
import { Course } from '../../../domain/entities/course';
import { CourseSource } from '../../../domain/entities/course-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateCourseDto = Record({
  course: Course,
  courseSource: CourseSource,
});

export type UpdateCourseDto = Static<typeof UpdateCourseDto>;
