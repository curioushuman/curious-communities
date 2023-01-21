import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Participant,
  ParticipantIdentifier,
  ParticipantIdentifierValue,
} from '../../domain/entities/participant';
import { ParticipantId } from '../../domain/value-objects/participant-id';
import { ParticipantSourceIdSourceValue } from '../../domain/value-objects/participant-source-id-source';

/**
 * Type for the findOne method interface within repository
 */
export type ParticipantFindMethod = (
  value: ParticipantIdentifierValue
) => TaskEither<Error, Participant>;

export abstract class ParticipantRepository {
  /**
   * Object lookup for findMethods
   */
  abstract findOneBy: Record<ParticipantIdentifier, ParticipantFindMethod>;

  /**
   * Find a participant
   *
   * This method will accept a participant identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(identifier: ParticipantIdentifier): ParticipantFindMethod;

  /**
   * Find a participant by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(id: ParticipantId): TaskEither<Error, Participant>;

  /**
   * Find a participant by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: ParticipantSourceIdSourceValue
  ): TaskEither<Error, Participant>;

  /**
   * Create/update a participant
   *
   * NOTE: full participant, not just the base
   * * This will be the pattern for children, i.e. we need that relation to save
   */
  abstract save(participant: Participant): TaskEither<Error, Participant>;
}
