import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Member,
  MemberIdentifier,
  MemberIdentifierValue,
} from '../../domain/entities/member';
import { MemberEmail } from '../../domain/value-objects/member-email';
import { MemberId } from '../../domain/value-objects/member-id';
import { MemberSourceIdSourceValue } from '../../domain/value-objects/member-source-id-source';

/**
 * TODO:
 * - [ ] move the find and check method types to generics
 */

/**
 * Type for the findOne method interface within repository
 */
export type MemberFindMethod = (
  value: MemberIdentifierValue
) => TaskEither<Error, Member>;

/**
 * Type for the check method interface within repository
 */
export type MemberCheckMethod = (
  value: MemberIdentifierValue
) => TaskEither<Error, boolean>;

export abstract class MemberRepository {
  /**
   * Object lookup for findMethods
   */
  abstract findOneBy: Record<MemberIdentifier, MemberFindMethod>;

  /**
   * Find a member
   *
   * This method will accept a member identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: MemberIdentifier): MemberFindMethod;

  /**
   * Find a member by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: MemberId): TaskEither<Error, Member>;

  /**
   * Find a member by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: MemberSourceIdSourceValue
  ): TaskEither<Error, Member>;

  /**
   * Find a member by the given email
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEmail(email: MemberEmail): TaskEither<Error, Member>;

  /**
   * Object lookup for checkMethods
   */
  abstract checkBy: Record<MemberIdentifier, MemberCheckMethod>;

  /**
   * Check a member exists
   *
   * This method will accept a member identifier and value
   * and then determine which checker method to use.
   *
   * * NOTE: will NOT throw NotFoundException if not found
   */
  abstract check(identifier: MemberIdentifier): MemberCheckMethod;

  /**
   * Check for existence of member by given ID
   */
  abstract checkById(id: MemberId): TaskEither<Error, boolean>;

  /**
   * Find a member by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract checkByIdSourceValue(
    value: MemberSourceIdSourceValue
  ): TaskEither<Error, boolean>;

  /**
   * Find a member by the given email
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract checkByEmail(email: MemberEmail): TaskEither<Error, boolean>;

  /**
   * Create/update a member
   */
  abstract save(member: Member): TaskEither<Error, Member>;
}
