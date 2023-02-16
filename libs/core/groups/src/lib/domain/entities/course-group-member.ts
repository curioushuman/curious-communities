import { Static } from 'runtypes';

import { ParticipantId } from '../value-objects/participant-id';
import { CourseId } from '../value-objects/course-id';
import { CourseGroupBase } from './course-group';
import {
  StandardGroupMemberBase,
  StandardGroupMemberIdentifiers,
} from './standard-group-member';
import { Member } from './member';

/**
 * Course group entity
 */
export const CourseGroupMemberBase = StandardGroupMemberBase.extend({
  participantId: ParticipantId,
  courseId: CourseId,

  // we could include things like open and close dates here
});

/**
 * Type for course group entity
 */
export type CourseGroupMemberBase = Static<typeof CourseGroupMemberBase>;

/**
 * Course group entity
 *
 * i.e. fields + relationships
 */
export const CourseGroupMember = CourseGroupMemberBase.extend({
  group: CourseGroupBase,
  // we could also include things like open and close dates here
  member: Member,
});

/**
 * Type for course group entity
 */
export type CourseGroupMember = Static<typeof CourseGroupMember>;

/**
 * Type that defines all the possible identifiers for a course group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export interface CourseGroupMemberIdentifiers
  extends StandardGroupMemberIdentifiers {
  participantId: ParticipantId;
}
export type CourseGroupMemberIdentifier = keyof CourseGroupMemberIdentifiers;
