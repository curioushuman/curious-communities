import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Participant,
  ParticipantIdentifier,
} from '../../domain/entities/participant';
import { ParticipantId } from '../../domain/value-objects/participant-id';

/**
 * Literal list of finders for a participant
 */
export type ParticipantFinder = 'findById' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (
  identifier: ParticipantIdentifier
): ParticipantFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as ParticipantFinder;
};

export abstract class ParticipantRepository {
  /**
   * Find a participant by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findById(id: ParticipantId): TaskEither<Error, Participant>;

  /**
   * Check for existence of participant by given ID
   */
  abstract checkById(id: ParticipantId): TaskEither<Error, boolean>;

  /**
   * Create/update a participant
   */
  abstract save(participant: Participant): TaskEither<Error, void>;
}
