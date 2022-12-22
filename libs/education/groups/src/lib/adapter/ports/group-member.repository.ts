import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  GroupMember,
  GroupMemberIdentifier,
} from '../../domain/entities/group-member';
import { GroupMemberId } from '../../domain/value-objects/group-member-id';

/**
 * Literal list of finders for a group-member
 */
export type GroupMemberFinder = 'findById' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (
  identifier: GroupMemberIdentifier
): GroupMemberFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as GroupMemberFinder;
};

export abstract class GroupMemberRepository {
  /**
   * Find a group-member by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findById(id: GroupMemberId): TaskEither<Error, GroupMember>;

  /**
   * Check for existence of group-member by given ID
   */
  abstract checkById(id: GroupMemberId): TaskEither<Error, boolean>;

  /**
   * Create/update a group-member
   */
  abstract save(groupMember: GroupMember): TaskEither<Error, void>;
}
