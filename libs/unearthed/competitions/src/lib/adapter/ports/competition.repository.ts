import { TaskEither } from 'fp-ts/lib/TaskEither';

import { Slug } from '@curioushuman/common';

import {
  Competition,
  CompetitionIdentifier,
} from '../../domain/entities/competition';
import { CompetitionId } from '../../domain/value-objects/competition-id';

/**
 * Literal list of finders for a competition
 */
export type CompetitionFinder = 'findById' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (
  identifier: CompetitionIdentifier
): CompetitionFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as CompetitionFinder;
};

export abstract class CompetitionRepository {
  abstract findById(id: CompetitionId): TaskEither<Error, Competition>;
  abstract findBySlug(slug: Slug): TaskEither<Error, Competition>;

  abstract save(competition: Competition): TaskEither<Error, void>;
}
