import { Optional, Record, Static } from 'runtypes';
import { RequestSource } from '@curioushuman/common';
import { CourseBaseResponseDto } from '../../dto/course.response.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpdateCourseRequestDto = Record({
  course: CourseBaseResponseDto,
  requestSource: Optional(RequestSource),
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpdateCourseRequestDto = Static<typeof UpdateCourseRequestDto>;
