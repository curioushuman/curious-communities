import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Group,
  GroupBase,
  GroupIdentifier,
  GroupIdentifierValue,
} from '../../domain/entities/group';
import { GroupSlug } from '../../domain/value-objects/group-slug';
import { GroupId } from '../../domain/value-objects/group-id';
import { GroupSourceIdSourceValue } from '../../domain/value-objects/group-source-id-source';
import {
  CourseGroup,
  CourseGroupBase,
  CourseGroupIdentifier,
  CourseGroupIdentifierValue,
} from '../../domain/entities/course-group';

/**
 * TODO:
 * - [ ] move some of the base find and check method types to generic class
 */

/**
 * Type to determine the correct identifiers
 */
export type GetGroupIdentifier<G> = G extends CourseGroup
  ? CourseGroupIdentifier
  : GroupIdentifier;

/**
 * Type to determine the correct identifier values
 */
type GetGroupIdentifierValue<G> = G extends CourseGroup
  ? CourseGroupIdentifierValue
  : GroupIdentifierValue;

/**
 * Type to determine the correct Base type
 */
type GetGroupBase<G> = G extends CourseGroup ? CourseGroupBase : GroupBase;

/**
 * Type for the findOne method interface within repository
 */
export type GroupFindMethod<G> = (
  value: GetGroupIdentifierValue<G>
) => TaskEither<Error, G>;

/**
 * Type for the check method interface within repository
 */
export type GroupCheckMethod<G> = (
  value: GetGroupIdentifierValue<G>
) => TaskEither<Error, boolean>;

/**
 * Base class for Group entity and derived entities
 */
export abstract class GroupRepositoryBase<G> {
  /**
   * Object lookup for findMethods
   */
  abstract readonly findOneBy: Record<
    GetGroupIdentifier<G>,
    GroupFindMethod<G>
  >;

  /**
   * Find a group
   *
   * This method will accept a group identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: GetGroupIdentifier<G>): GroupFindMethod<G>;

  /**
   * Find a group by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: GroupId): TaskEither<Error, G>;

  /**
   * Find a group by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: GroupSourceIdSourceValue
  ): TaskEither<Error, G>;

  /**
   * Find a group by the given slug
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneBySlug(slug: GroupSlug): TaskEither<Error, G>;

  /**
   * Object lookup for checkMethods
   */
  abstract readonly checkBy: Record<GetGroupIdentifier<G>, GroupCheckMethod<G>>;

  /**
   * Check a group exists
   *
   * This method will accept a group identifier and value
   * and then determine which checker method to use.
   *
   * * NOTE: will NOT throw NotFoundException if not found
   */
  abstract check(identifier: GetGroupIdentifier<G>): GroupCheckMethod<G>;

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
  abstract save(group: Group | GetGroupBase<G>): TaskEither<Error, G>;
}
