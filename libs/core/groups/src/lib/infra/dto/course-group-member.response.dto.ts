import { Static, String } from 'runtypes';
import config from '../../static/config';
import { CourseGroupBaseResponseDto } from './course-group.response.dto';
import { GroupMemberResponseDto } from './group-member-response.dto';
import { MemberDto } from './member.dto';
import { StandardGroupMemberBaseResponseDto } from './standard-group-member.response.dto';

/**
 * The base structure of CourseGroupMember data we will pass between our applications
 *
 * i.e. just the fields
 */
export const CourseGroupMemberBaseResponseDto =
  StandardGroupMemberBaseResponseDto.extend({
    courseId: String,
    participantId: String,
  });

/**
 * The base structure of CourseGroupMember data we will pass between our applications
 *
 * i.e. just the fields
 */
export type CourseGroupMemberBaseResponseDto = Static<
  typeof CourseGroupMemberBaseResponseDto
>;

/**
 * Course group base response predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isCourseGroupMemberResponseDto(
  groupMember: GroupMemberResponseDto
): groupMember is CourseGroupMemberResponseDto {
  return (
    (groupMember as CourseGroupMemberResponseDto)._type ===
    config.defaults.groupTypeCourse
  );
}

/**
 * The structure of CourseGroupMember data we will pass between our applications
 *
 * i.e. fields and relationships
 */

export const CourseGroupMemberResponseDto =
  CourseGroupMemberBaseResponseDto.extend({
    group: CourseGroupBaseResponseDto,
    member: MemberDto,
  });

/**
 * The structure of CourseGroupMember data we will pass between our applications
 *
 * i.e. fields and relationships
 */
export type CourseGroupMemberResponseDto = Static<
  typeof CourseGroupMemberResponseDto
>;
