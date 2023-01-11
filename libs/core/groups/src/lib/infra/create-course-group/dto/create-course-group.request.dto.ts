import { Record, Static } from 'runtypes';
import { CourseDto } from '../../dto/course.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const CreateCourseGroupRequestDto = Record({
  course: CourseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type CreateCourseGroupRequestDto = Static<
  typeof CreateCourseGroupRequestDto
>;
