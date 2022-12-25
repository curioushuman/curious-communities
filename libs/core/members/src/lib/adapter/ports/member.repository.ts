import { TaskEither } from 'fp-ts/lib/TaskEither';

import { Member, MemberIdentifier } from '../../domain/entities/member';
import { MemberIdExternal } from '../../domain/value-objects/member-id-external';
import { MemberSlug } from '../../domain/value-objects/member-slug';

/**
 * Literal list of finders for a member
 */
export type MemberFinder = 'findById' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (
  identifier: MemberIdentifier
): MemberFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as MemberFinder;
};

export abstract class MemberRepository {
  /**
   * Find a member by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findByExternalId(
    externalId: MemberIdExternal
  ): TaskEither<Error, Member>;

  /**
   * Find a member by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findBySlug(slug: MemberSlug): TaskEither<Error, Member>;

  /**
   * Check for existence of member by given ID
   */
  abstract checkByExternalId(
    externalId: MemberIdExternal
  ): TaskEither<Error, boolean>;

  /**
   * Create/update a member
   */
  abstract save(member: Member): TaskEither<Error, void>;
}
