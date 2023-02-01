import { RepositoryFindBy, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  MemberSource,
  MemberSourceForCreate,
  MemberSourceIdentifier,
  MemberSourceIdentifiers,
} from '../../domain/entities/member-source';
import { MemberEmail } from '../../domain/value-objects/member-email';
import { MemberSourceIdSource } from '../../domain/value-objects/member-source-id-source';

/**
 * Type for the findOne method interface within repository
 */
export type MemberSourceFindMethod = RepositoryFindMethod<
  MemberSourceIdentifiers,
  MemberSource
>;

export abstract class MemberSourceRepositoryRead
  implements RepositoryFindBy<MemberSourceIdentifiers, MemberSource>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<MemberSourceIdentifier, MemberSourceFindMethod>;
  abstract findOne(identifier: MemberSourceIdentifier): MemberSourceFindMethod;

  /**
   * Find a member by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByIdSource(
    id: MemberSourceIdSource
  ): TaskEither<Error, MemberSource>;

  /**
   * Find a member by the given email
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEmail(email: MemberEmail): TaskEither<Error, MemberSource>;
}

export abstract class MemberSourceRepositoryReadWrite extends MemberSourceRepositoryRead {
  /**
   * Create/update a member
   */
  abstract create(
    member: MemberSourceForCreate
  ): TaskEither<Error, MemberSource>;

  /**
   * Create/update a member
   */
  abstract update(member: MemberSource): TaskEither<Error, MemberSource>;
}
