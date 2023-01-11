import { TaskEither } from 'fp-ts/lib/TaskEither';
import { GroupMemberForSourceIdentify } from '../../domain/entities/group-member';

import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
  GroupMemberSourceIdentifier,
  GroupMemberSourceIdentifierValue,
} from '../../domain/entities/group-member-source';
import { GroupMemberSourceId } from '../../domain/value-objects/group-member-source-id';
import { Source } from '../../domain/value-objects/source';

/**
 * Type for the findOne method interface within repository
 */
export type GroupMemberSourceFindMethod = (
  value: GroupMemberSourceIdentifierValue
) => TaskEither<Error, GroupMemberSource>;

/**
 * Repository for group member sources
 *
 * TODO
 * - [ ] abstract some of the common items
 *       two levels, one for base, one for source/external vs internal
 */
export abstract class GroupMemberSourceRepository {
  /**
   * Each source repository should also be marked with the source
   * it represents
   */
  abstract readonly source: Source;

  /**
   * Object lookup for findMethods
   */
  abstract readonly findOneBy: Record<
    GroupMemberSourceIdentifier,
    GroupMemberSourceFindMethod
  >;

  /**
   * Find a group
   *
   * This method will accept a group identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(
    identifier: GroupMemberSourceIdentifier
  ): GroupMemberSourceFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   * - idSource is parsed to id in application layer
   */
  abstract findOneById(
    id: GroupMemberSourceId
  ): TaskEither<Error, GroupMemberSource>;

  /**
   * Find a source, from the entity it reflects
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEntity(
    group: GroupMemberForSourceIdentify
  ): TaskEither<Error, GroupMemberSource>;

  /**
   * Create/update a group
   */
  abstract create(
    group: GroupMemberSourceForCreate
  ): TaskEither<Error, GroupMemberSource>;

  /**
   * Create/update a group
   */
  abstract update(
    group: GroupMemberSource
  ): TaskEither<Error, GroupMemberSource>;
}

export abstract class GroupMemberSourceCommunityRepository extends GroupMemberSourceRepository {}
export abstract class GroupMemberSourceMicroCourseRepository extends GroupMemberSourceRepository {}
