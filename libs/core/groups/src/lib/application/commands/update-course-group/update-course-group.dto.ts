import { Record, Static } from 'runtypes';
import { CourseDto } from '../../../infra/dto/course.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpdateCourseGroupDto = Record({
  course: CourseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpdateCourseGroupDto = Static<typeof UpdateCourseGroupDto>;
