import {
  RepositoryFindOneWithParent,
  RepositoryFindOneWithParentMethod,
} from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  GroupMember,
  GroupMemberIdentifier,
  GroupMemberIdentifiers,
} from '../../domain/entities/group-member';
import { GroupId } from '../../domain/value-objects/group-id';
import { MemberId } from '../../domain/value-objects/member-id';
import { ParticipantId } from '../../domain/value-objects/participant-id';

export type GroupMemberFindMethod = RepositoryFindOneWithParentMethod<
  GroupMemberIdentifiers,
  GroupMember,
  GroupId
>;

/**
 * A repository for groupMembers
 *
 * NOTES:
 * - repos for child entities, by default, ALWAYS include the parent
 */
export abstract class GroupMemberRepository
  implements
    RepositoryFindOneWithParent<GroupMemberIdentifiers, GroupMember, GroupId>
{
  /**
   * FindOneWithParent interface
   */
  abstract findOneBy: Record<GroupMemberIdentifier, GroupMemberFindMethod>;
  abstract findOne(identifier: GroupMemberIdentifier): GroupMemberFindMethod;

  /**
   * Find a groupMember by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   *
   * ! UPDATE: removing until we've decided what to do about the fact
   * we need the groupId as well as the groupMemberId for DynamoDb
   */
  // abstract findOneById(id: GroupMemberId): TaskEither<Error, GroupMember>;

  /**
   * Find a groupMember by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByMemberId(props: {
    value: MemberId;
    parentId: GroupId;
  }): TaskEither<Error, GroupMember>;

  /**
   * Find a group member by the given participant ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByParticipantId(props: {
    value: ParticipantId;
    parentId: GroupId;
  }): TaskEither<Error, GroupMember>;

  /**
   * Create/update a groupMember
   *
   * NOTE: full groupMember, not just the base
   * * This will be the pattern for children, i.e. we need entity.parent to save
   */
  abstract save(groupMember: GroupMember): TaskEither<Error, GroupMember>;
}
