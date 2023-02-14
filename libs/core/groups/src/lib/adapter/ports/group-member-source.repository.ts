import {
  RepositoryFindOneWithParent,
  RepositoryFindOneWithParentMethod,
} from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
  GroupMemberSourceIdentifier,
  GroupMemberSourceIdentifiers,
} from '../../domain/entities/group-member-source';
import { GroupMemberEmail } from '../../domain/value-objects/group-member-email';
import { GroupMemberSourceIdSource } from '../../domain/value-objects/group-member-source-id-source';
import { GroupSourceId } from '../../domain/value-objects/group-source-id';

/**
 * Type for the findOne method interface within repository
 */
export type GroupMemberSourceFindMethod = RepositoryFindOneWithParentMethod<
  GroupMemberSourceIdentifiers,
  GroupMemberSource,
  GroupSourceId
>;

export abstract class GroupMemberSourceRepositoryRead
  implements
    RepositoryFindOneWithParent<
      GroupMemberSourceIdentifiers,
      GroupMemberSource,
      GroupSourceId
    >
{
  /**
   * FindOneWithParent interface
   */
  abstract findOneBy: Record<
    GroupMemberSourceIdentifier,
    GroupMemberSourceFindMethod
  >;
  abstract findOne(
    identifier: GroupMemberSourceIdentifier
  ): GroupMemberSourceFindMethod;

  /**
   * Find a group by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByIdSource(props: {
    value: GroupMemberSourceIdSource;
    parentId: GroupSourceId;
  }): TaskEither<Error, GroupMemberSource>;

  /**
   * Find a group by the given email
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByEmail(props: {
    value: GroupMemberEmail;
    parentId: GroupSourceId;
  }): TaskEither<Error, GroupMemberSource>;
}

export abstract class GroupMemberSourceRepositoryReadWrite extends GroupMemberSourceRepositoryRead {
  /**
   * Create/update a group
   */
  abstract create(props: {
    groupMember: GroupMemberSourceForCreate;
    parentId: GroupSourceId;
  }): TaskEither<Error, GroupMemberSource>;

  /**
   * Create/update a group
   */
  abstract update(props: {
    groupMember: GroupMemberSource;
    parentId: GroupSourceId;
  }): TaskEither<Error, GroupMemberSource>;
}
