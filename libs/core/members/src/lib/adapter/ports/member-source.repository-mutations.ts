import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  MemberSource,
  MemberSourceForCreate,
} from '../../domain/entities/member-source';

export abstract class MemberSourceRepositoryMutations {
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
