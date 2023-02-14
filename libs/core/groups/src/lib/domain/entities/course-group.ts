import { Array, Static } from 'runtypes';

import { CourseId } from '../value-objects/course-id';
import { CourseGroupMemberBase } from './course-group-member';
import { StandardGroupBase, StandardGroupIdentifiers } from './standard-group';

/**
 * Course group entity
 */
export const CourseGroupBase = StandardGroupBase.extend({
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
 */
export const CourseGroup = CourseGroupBase.extend({
  groupMembers: Array(CourseGroupMemberBase),

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
export interface CourseGroupIdentifiers extends StandardGroupIdentifiers {
  courseId: CourseId;
}
export type CourseGroupIdentifier = keyof CourseGroupIdentifiers;
