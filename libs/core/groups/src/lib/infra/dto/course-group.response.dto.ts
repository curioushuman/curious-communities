import { Array, Static, String } from 'runtypes';
import config from '../../static/config';
import { CourseGroupMemberBaseResponseDto } from './course-group-member.response.dto';
import { GroupBaseResponseDto } from './group.response.dto';
import { StandardGroupBaseResponseDto } from './standard-group.response.dto';

/**
 * The base structure of CourseGroup data we will pass between our applications
 */
export const CourseGroupBaseResponseDto = StandardGroupBaseResponseDto.extend({
  courseId: String,
});

/**
 * The base structure of CourseGroup data we will pass between our applications
 */
export type CourseGroupBaseResponseDto = Static<
  typeof CourseGroupBaseResponseDto
>;

/**
 * Course group base response predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isCourseGroupBaseResponseDto(
  group: GroupBaseResponseDto
): group is CourseGroupBaseResponseDto {
  return (
    (group as CourseGroupBaseResponseDto)._type ===
    config.defaults.groupTypeCourse
  );
}

/**
 * The structure of CourseGroup data we will pass between our applications
 */
export const CourseGroupResponseDto = CourseGroupBaseResponseDto.extend({
  groupMembers: Array(CourseGroupMemberBaseResponseDto),
});

/**
 * The structure of CourseGroup data we will pass between our applications
 */
export type CourseGroupResponseDto = Static<typeof CourseGroupResponseDto>;
