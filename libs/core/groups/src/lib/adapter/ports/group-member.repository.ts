import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  GroupMember,
  GroupMemberBase,
  GroupMemberForSourceIdentify,
  GroupMemberIdentifier,
  GroupMemberIdentifierValue,
} from '../../domain/entities/group-member';
import { GroupMemberId } from '../../domain/value-objects/group-member-id';
import { GroupMemberSourceIdSourceValue } from '../../domain/value-objects/group-member-source-id-source';

/**
 * TODO:
 * - [ ] move the find and check method types to generics
 */

/**
 * Type for the findOne method interface within repository
 */
export type GroupMemberFindMethod = (
  value: GroupMemberIdentifierValue
) => TaskEither<Error, GroupMember>;

export abstract class GroupMemberRepository {
  /**
   * Object lookup for findMethods
   */
  abstract readonly findOneBy: Record<
    GroupMemberIdentifier,
    GroupMemberFindMethod
  >;

  /**
   * Find a group
   *
   * This method will accept a group identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: GroupMemberIdentifier): GroupMemberFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: GroupMemberId): TaskEither<Error, GroupMember>;

  /**
   * Find a group by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: GroupMemberSourceIdSourceValue
  ): TaskEither<Error, GroupMember>;

  /**
   * Find a source, from the entity it reflects
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEntity(
    group: GroupMemberForSourceIdentify
  ): TaskEither<Error, GroupMember>;

  /**
   * Check a group member exists
   *
   * * NOTE: will NOT throw NotFoundException if not found
   */
  abstract check(groupMember: GroupMemberBase): TaskEither<Error, boolean>;

  /**
   * Create/update a group
   */
  abstract save(
    group: GroupMember | GroupMemberBase
  ): TaskEither<Error, GroupMember>;
}
