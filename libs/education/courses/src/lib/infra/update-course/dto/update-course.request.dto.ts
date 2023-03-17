import { Optional, Record, Static, String } from 'runtypes';
import { RequestSource } from '@curioushuman/common';
import { CourseBaseResponseDto } from '../../dto/course.response.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpdateCourseRequestDto = Record({
  course: Optional(CourseBaseResponseDto),
  idSourceValue: Optional(String),
  requestSource: Optional(RequestSource),
}).withConstraint((dto) => !!(dto.course || dto.idSourceValue));

/**
 * DTO that accepts any of the identifiers
 */
export type UpdateCourseRequestDto = Static<typeof UpdateCourseRequestDto>;
