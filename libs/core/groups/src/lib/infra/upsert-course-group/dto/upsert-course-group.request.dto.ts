import { Record, Static } from 'runtypes';
import { CourseDto } from '../../dto/course.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpsertCourseGroupRequestDto = Record({
  course: CourseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpsertCourseGroupRequestDto = Static<
  typeof UpsertCourseGroupRequestDto
>;
