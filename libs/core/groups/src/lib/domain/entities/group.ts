import { Static, Union } from 'runtypes';
import { prepareExternalIdSource } from '@curioushuman/common';
import { GroupSourceId } from '../value-objects/group-source-id';
import { GroupSourceIdSource } from '../value-objects/group-source-id-source';
import { Source } from '../value-objects/source';
import {
  CourseGroup,
  CourseGroupBase,
  CourseGroupIdentifiers,
} from './course-group';
import {
  StandardGroup,
  StandardGroupBase,
  StandardGroupIdentifiers,
} from './standard-group';
import config from '../../static/config';

/**
 * Type for group base entity
 *
 * Note: Is Runtype, as used for validation in command
 */
export const GroupBase = Union(StandardGroupBase, CourseGroupBase);
export type GroupBase = Static<typeof GroupBase>;

/**
 * Course group base predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isCourseGroupBase(group: GroupBase): group is CourseGroupBase {
  return (group as CourseGroupBase)._type === config.defaults.groupTypeCourse;
}

/**
 * Type for group entity
 *
 * Will inherit the discriminator from GroupBase
 */
export type Group = StandardGroup | CourseGroup;

/**
 * Type that defines all the possible identifiers for a course group
 * NOTE: this is utilized in find-group.dto.ts and group.repository.ts
 * to define parsers and finders.
 */
export type GroupIdentifiers = StandardGroupIdentifiers &
  CourseGroupIdentifiers;
export type GroupIdentifier = keyof GroupIdentifiers;

/**
 * Convenience function to prepare a GroupSourceIdSource
 *
 * ! What is returned isn't seen as GroupSourceIdSource by TS
 *   Additional checks are still required
 *
 * TODO:
 * - [ ] prepareExternalIdSource should return a GroupSourceIdSource
 *
 */
export function prepareGroupExternalIdSource(
  idSourceValue: string
): GroupSourceIdSource {
  return GroupSourceIdSource.check(
    prepareExternalIdSource(idSourceValue, GroupSourceId, Source)
  );
}
