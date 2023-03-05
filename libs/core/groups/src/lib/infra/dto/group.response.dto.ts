import { Static, Union } from 'runtypes';
import {
  CourseGroupBaseResponseDto,
  CourseGroupResponseDto,
} from './course-group.response.dto';
import {
  StandardGroupBaseResponseDto,
  StandardGroupResponseDto,
} from './standard-group.response.dto';

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

/**
 * Type for group entity
 *
 * NOTE: just a type, we don't use this for validation
 */
export type GroupResponseDto =
  | CourseGroupResponseDto
  | StandardGroupResponseDto;
