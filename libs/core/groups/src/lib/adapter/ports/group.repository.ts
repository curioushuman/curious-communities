import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  GroupBase,
  GroupIdentifier,
  GroupIdentifiers,
} from '../../domain/entities/group';
import { GroupSlug } from '../../domain/value-objects/group-slug';
import { GroupSourceIdSourceValue } from '../../domain/value-objects/group-source-id-source';
import { GroupId } from '../../domain/value-objects/group-id';
import { RepositoryFindOne, RepositoryFindMethod } from '@curioushuman/common';
import { CourseId } from '../../domain/value-objects/course-id';

/**
 * TODO:
 * - [ ] move the find and check method types to generics
 * - [ ] add functions (or flags) to find group with children
 * - [ ] queryBy are for searches not based on identifiers
 */

/**
 * Type for the findOne method interface within repository
 */
export type GroupFindMethod = RepositoryFindMethod<GroupIdentifiers, GroupBase>;

/**
 * A repository for groups
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 */
export abstract class GroupRepository
  implements RepositoryFindOne<GroupIdentifiers, GroupBase>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<GroupIdentifier, GroupFindMethod>;
  abstract findOne(identifier: GroupIdentifier): GroupFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: GroupId): TaskEither<Error, GroupBase>;

  /**
   * Find a group by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: GroupSourceIdSourceValue
  ): TaskEither<Error, GroupBase>;

  /**
   * Find a group by the given slug
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneBySlug(slug: GroupSlug): TaskEither<Error, GroupBase>;

  /**
   * Find a group by the given course ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByCourseId(id: CourseId): TaskEither<Error, GroupBase>;

  /**
   * Create/update a group
   *
   * NOTE: just the base, not the full group
   * * This will be the pattern for parents, just the base
   */
  abstract save(group: GroupBase): TaskEither<Error, GroupBase>;
}
