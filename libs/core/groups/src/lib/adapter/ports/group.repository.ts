import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Group,
  GroupIdentifier,
  GroupIdentifierValue,
} from '../../domain/entities/group';
import { GroupSlug } from '../../domain/value-objects/group-slug';
import { GroupId } from '../../domain/value-objects/group-id';
import { GroupSourceIdSourceValue } from '../../domain/value-objects/group-source-id-source';

/**
 * TODO:
 * - [ ] move the find and check method types to generics
 */

/**
 * Type for the findOne method interface within repository
 */
export type GroupFindMethod = (
  value: GroupIdentifierValue
) => TaskEither<Error, Group>;

/**
 * Type for the check method interface within repository
 */
export type GroupCheckMethod = (
  value: GroupIdentifierValue
) => TaskEither<Error, boolean>;

export abstract class GroupRepository {
  /**
   * Object lookup for findMethods
   */
  abstract findOneBy: Record<GroupIdentifier, GroupFindMethod>;

  /**
   * Find a group
   *
   * This method will accept a group identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: GroupIdentifier): GroupFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: GroupId): TaskEither<Error, Group>;

  /**
   * Find a group by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: GroupSourceIdSourceValue
  ): TaskEither<Error, Group>;

  /**
   * Find a group by the given slug
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneBySlug(slug: GroupSlug): TaskEither<Error, Group>;

  /**
   * Object lookup for checkMethods
   */
  abstract checkBy: Record<GroupIdentifier, GroupCheckMethod>;

  /**
   * Check a group exists
   *
   * This method will accept a group identifier and value
   * and then determine which checker method to use.
   *
   * * NOTE: will NOT throw NotFoundException if not found
   */
  abstract check(identifier: GroupIdentifier): GroupCheckMethod;

  /**
   * Check for existence of group by given ID
   */
  abstract checkById(id: GroupId): TaskEither<Error, boolean>;

  /**
   * Find a group by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract checkByIdSourceValue(
    value: GroupSourceIdSourceValue
  ): TaskEither<Error, boolean>;

  /**
   * Find a group by the given slug
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract checkBySlug(slug: GroupSlug): TaskEither<Error, boolean>;

  /**
   * Create/update a group
   */
  abstract save(group: Group): TaskEither<Error, Group>;
}
