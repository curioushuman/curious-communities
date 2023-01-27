import { RepositoryFindBy, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  MemberSource,
  MemberSourceForCreate,
  MemberSourceIdentifier,
  MemberSourceIdentifiers,
} from '../../domain/entities/member-source';
import { MemberEmail } from '../../domain/value-objects/member-email';
import { MemberSourceId } from '../../domain/value-objects/member-source-id';

/**
 * Type for the findOne method interface within repository
 */
export type MemberSourceFindMethod = RepositoryFindMethod<
  MemberSourceIdentifiers,
  MemberSource
>;

export abstract class MemberSourceRepository
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
   * - idSource is parsed to id in application layer
   */
  abstract findOneById(id: MemberSourceId): TaskEither<Error, MemberSource>;

  /**
   * Find a member by the given email
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByEmail(email: MemberEmail): TaskEither<Error, MemberSource>;

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

export abstract class MemberSourceAuthRepository extends MemberSourceRepository {}
export abstract class MemberSourceCommunityRepository extends MemberSourceRepository {}
export abstract class MemberSourceCrmRepository extends MemberSourceRepository {}
export abstract class MemberSourceMicroCourseRepository extends MemberSourceRepository {}
