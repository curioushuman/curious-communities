import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Member,
  MemberIdentifier,
  MemberIdentifiers,
} from '../../domain/entities/member';
import { MemberEmail } from '../../domain/value-objects/member-email';
import { MemberSourceIdSourceValue } from '../../domain/value-objects/member-source-id-source';
import { MemberId } from '../../domain/value-objects/member-id';
import { RepositoryFindBy, RepositoryFindMethod } from '@curioushuman/common';

/**
 * TODO:
 * - [ ] queryBy are for searches not based on identifiers
 */

/**
 * Type for the findOne method interface within repository
 */
export type MemberFindMethod = RepositoryFindMethod<MemberIdentifiers, Member>;

/**
 * A repository for members
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 */
export abstract class MemberRepository
  implements RepositoryFindBy<MemberIdentifiers, Member>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<MemberIdentifier, MemberFindMethod>;
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
   * Find a member by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEmail(email: MemberEmail): TaskEither<Error, Member>;

  /**
   * Create/update a member
   *
   * NOTE: just the base, not the full member
   * * This will be the pattern for parents, just the base
   */
  abstract save(member: Member): TaskEither<Error, Member>;
}
