import { Static, Union } from 'runtypes';
import {
  CourseGroupMember,
  CourseGroupMemberBase,
  CourseGroupMemberIdentifiers,
} from './course-group-member';
import {
  StandardGroupMember,
  StandardGroupMemberBase,
  StandardGroupMemberIdentifiers,
} from './standard-group-member';
import config from '../../static/config';
import { CourseGroupBase } from './course-group';
import { StandardGroupBase } from './standard-group';
import { Member } from './member';

/**
 * Type for group member base entity
 */
export type GroupMemberBase = StandardGroupMemberBase | CourseGroupMemberBase;

/**
 * Type for group member entity
 *
 * Note: Is Runtype, as used for validation in command
 */
export const GroupMember = Union(StandardGroupMember, CourseGroupMember);
export type GroupMember = Static<typeof GroupMember>;

/**
 * Type for what can be updated on a group member, en masse
 */
export const GroupMemberForMultiUpdate = StandardGroupMemberBase.pick('status');
/**
 * Type for what can be updated on a group member, en masse
 */
export type GroupMemberForMultiUpdate = Static<
  typeof GroupMemberForMultiUpdate
>;

/**
 * An alternative parser, instead of GroupMember.check()
 *
 * GroupMember being a Union and a Composite I think has proven too much
 */
export const parseGroupMember = (groupMember: GroupMember): GroupMember => {
  const { group, member, ...groupMemberBase } = groupMember;

  let parsedGroupBase;
  let parsedGroupMemberBase;
  if (group._type === config.defaults.groupTypeCourse) {
    parsedGroupBase = CourseGroupBase.check(group);
    parsedGroupMemberBase = CourseGroupMemberBase.check(groupMemberBase);
  } else {
    parsedGroupBase = StandardGroupBase.check(group);
    parsedGroupMemberBase = StandardGroupMemberBase.check(groupMemberBase);
  }

  return {
    ...parsedGroupMemberBase,
    group: parsedGroupBase,
    member: Member.check(member),
  };
};

/**
 * Course group member predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isCourseGroupMember(
  groupMember: GroupMember
): groupMember is CourseGroupMember {
  return (
    (groupMember as CourseGroupMember)._type === config.defaults.groupTypeCourse
  );
}

/**
 * Type that defines all the possible identifiers for a course group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export type GroupMemberIdentifiers = StandardGroupMemberIdentifiers &
  CourseGroupMemberIdentifiers;
export type GroupMemberIdentifier = keyof GroupMemberIdentifiers;
