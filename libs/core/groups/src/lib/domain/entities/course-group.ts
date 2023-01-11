import { Array, Static } from 'runtypes';

import { ValueOf } from '@curioushuman/common';

import { GroupBase, GroupIdentifiers } from './group';
import { CourseId } from '../value-objects/course-id';
import { GroupMemberBase } from './group-member';

/**
 * Course group entity
 */
export const CourseGroupBase = GroupBase.extend({
  courseId: CourseId,

  // we could include things like open and close dates here
});

/**
 * Type for course group entity
 */
export type CourseGroupBase = Static<typeof CourseGroupBase>;

/**
 * Course group entity
 *
 * i.e. fields + relationships
 *
 * * NOTE: I would have preferred to do this
 * Group.extend({ courseId: CourseId })
 * But this threw an error :()
 */
export const CourseGroup = CourseGroupBase.extend({
  members: Array(GroupMemberBase),

  // we could include things like open and close dates here
});

/**
 * Type for course group entity
 */
export type CourseGroup = Static<typeof CourseGroup>;

/**
 * Type that defines all the possible identifiers for a course group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export interface CourseGroupIdentifiers extends GroupIdentifiers {
  courseId: CourseId;
}
export type CourseGroupIdentifier = keyof CourseGroupIdentifiers;
export type CourseGroupIdentifierValue = ValueOf<CourseGroupIdentifiers>;
