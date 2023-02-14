import { RepositoryFindOne, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  GroupSource,
  GroupSourceForCreate,
  GroupSourceIdentifier,
  GroupSourceIdentifiers,
} from '../../domain/entities/group-source';
import { GroupName } from '../../domain/value-objects/group-name';
import { GroupSourceIdSource } from '../../domain/value-objects/group-source-id-source';

/**
 * Type for the findOne method interface within repository
 */
export type GroupSourceFindMethod = RepositoryFindMethod<
  GroupSourceIdentifiers,
  GroupSource
>;

export abstract class GroupSourceRepositoryRead
  implements RepositoryFindOne<GroupSourceIdentifiers, GroupSource>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<GroupSourceIdentifier, GroupSourceFindMethod>;
  abstract findOne(identifier: GroupSourceIdentifier): GroupSourceFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByIdSource(
    id: GroupSourceIdSource
  ): TaskEither<Error, GroupSource>;

  /**
   * Find a group by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByName(value: GroupName): TaskEither<Error, GroupSource>;
}

export abstract class GroupSourceRepositoryReadWrite extends GroupSourceRepositoryRead {
  /**
   * Create/update a group
   */
  abstract create(group: GroupSourceForCreate): TaskEither<Error, GroupSource>;

  /**
   * Create/update a group
   */
  abstract update(group: GroupSource): TaskEither<Error, GroupSource>;
}
