import { Static, Union } from 'runtypes';
import config from '../../static/config';
import {
  CourseGroupMemberBaseResponseDto,
  CourseGroupMemberResponseDto,
} from './course-group-member.response.dto';
import { CourseGroupBaseResponseDto } from './course-group.response.dto';
import { MemberDto } from './member.dto';
import {
  StandardGroupMemberBaseResponseDto,
  StandardGroupMemberResponseDto,
} from './standard-group-member.response.dto';
import { StandardGroupBaseResponseDto } from './standard-group.response.dto';

/**
 * Type for group member entity
 *
 * Note: Is Runtype, as used for validation in command
 */
export const GroupMemberResponseDto = Union(
  StandardGroupMemberResponseDto,
  CourseGroupMemberResponseDto
);
export type GroupMemberResponseDto = Static<typeof GroupMemberResponseDto>;

/**
 * An alternative parser, instead of GroupMemberResponseDto.check()
 *
 * GroupMemberResponseDto being a Union and a Composite I think has proven too much
 */
export const parseGroupMemberResponseDto = (
  groupMemberResponse: GroupMemberResponseDto
): GroupMemberResponseDto => {
  const { group, member, ...groupMemberBaseResponse } = groupMemberResponse;

  let parsedGroupBase;
  let parsedGroupMemberBase;
  if (group._type === config.defaults.groupTypeCourse) {
    parsedGroupBase = CourseGroupBaseResponseDto.check(group);
    parsedGroupMemberBase = CourseGroupMemberBaseResponseDto.check(
      groupMemberBaseResponse
    );
  } else {
    parsedGroupBase = StandardGroupBaseResponseDto.check(group);
    parsedGroupMemberBase = StandardGroupMemberBaseResponseDto.check(
      groupMemberBaseResponse
    );
  }

  return {
    ...parsedGroupMemberBase,
    group: parsedGroupBase,
    member: MemberDto.check(member),
  };
};
