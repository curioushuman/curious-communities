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
import { GroupSourceId } from '../../domain/value-objects/group-source-id';
import { MemberEmail } from '../../domain/value-objects/member-email';
import { MemberSourceId } from '../../domain/value-objects/member-source-id';

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
   * Find a group member by the given ID
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByMemberId(props: {
    value: MemberSourceId;
    parentId: GroupSourceId;
  }): TaskEither<Error, GroupMemberSource>;

  /**
   * Find a group member by the given email
   *
   * NOTES
   * - will throw NotFoundException if not found
   */
  abstract findOneByMemberEmail(props: {
    value: MemberEmail;
    parentId: GroupSourceId;
  }): TaskEither<Error, GroupMemberSource>;
}

export abstract class GroupMemberSourceRepositoryReadWrite extends GroupMemberSourceRepositoryRead {
  /**
   * Create a group member
   */
  abstract create(
    groupMember: GroupMemberSourceForCreate
  ): TaskEither<Error, GroupMemberSource>;

  /**
   * Update a group member
   */
  abstract update(
    groupMember: GroupMemberSource
  ): TaskEither<Error, GroupMemberSource>;

  /**
   * Delete a group member
   */
  abstract delete(groupMember: GroupMemberSource): TaskEither<Error, void>;
}
