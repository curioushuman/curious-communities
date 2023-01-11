import { Record, Static } from 'runtypes';
import { CourseDto } from '../../dto/course.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpdateCourseGroupRequestDto = Record({
  course: CourseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpdateCourseGroupRequestDto = Static<
  typeof UpdateCourseGroupRequestDto
>;
