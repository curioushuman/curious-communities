import { Record, Static } from 'runtypes';
import { CourseGroupBase } from '../../../domain/entities/course-group';

/**
 * DTO that accepts any of the identifiers
 */
export const CreateCourseGroupDto = Record({
  group: CourseGroupBase,
});

/**
 * DTO that accepts any of the identifiers
 */
export type CreateCourseGroupDto = Static<typeof CreateCourseGroupDto>;
