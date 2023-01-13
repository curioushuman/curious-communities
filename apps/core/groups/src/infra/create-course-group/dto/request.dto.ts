import { Record, Static } from 'runtypes';
import { CourseDto } from '@curioushuman/cc-groups-service';

/**
 * I am going to import the course DTO here
 *
 * NOTE
 * ? we still need to work out if the course should be as an attribute,
 * ? OR if CreateCourseGroupRequestDto should literally be a branded CourseDto
 */

export const CreateCourseGroupRequestDto = Record({
  course: CourseDto,
});

export type CreateCourseGroupRequestDto = Static<
  typeof CreateCourseGroupRequestDto
>;
