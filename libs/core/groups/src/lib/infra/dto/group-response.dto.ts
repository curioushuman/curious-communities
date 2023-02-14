import { Static, Union } from 'runtypes';
import { CourseGroupBaseResponseDto } from './course-group.response.dto';
import { StandardGroupBaseResponseDto } from './standard-group.response.dto';

/**
 * Type for group base entity
 *
 * Note: Is Runtype, as used for validation in command
 */
export const GroupBaseResponseDto = Union(
  StandardGroupBaseResponseDto,
  CourseGroupBaseResponseDto
);
export type GroupBaseResponseDto = Static<typeof GroupBaseResponseDto>;
