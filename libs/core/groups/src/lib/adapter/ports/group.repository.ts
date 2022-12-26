import { TaskEither } from 'fp-ts/lib/TaskEither';

import { Group, GroupIdentifier } from '../../domain/entities/group';
import { GroupId } from '../../domain/value-objects/group-id';
import { GroupSlug } from '../../domain/value-objects/group-slug';

/**
 * Literal list of finders for a group
 */
export type GroupFinder = 'findById' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (identifier: GroupIdentifier): GroupFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as GroupFinder;
};

export abstract class GroupRepository {
  /**
   * Find a group by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findById(id: GroupId): TaskEither<Error, Group>;

  /**
   * Find a group by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findBySlug(slug: GroupSlug): TaskEither<Error, Group>;

  /**
   * Check for existence of group by given ID
   */
  abstract checkById(id: GroupId): TaskEither<Error, boolean>;

  /**
   * Create/update a group
   */
  abstract save(group: Group): TaskEither<Error, void>;
}
