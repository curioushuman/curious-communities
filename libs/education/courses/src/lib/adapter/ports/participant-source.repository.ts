import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  ParticipantSource,
  ParticipantSourceIdentifier,
  ParticipantSourceIdentifierValue,
} from '../../domain/entities/participant-source';
import { ParticipantSourceId } from '../../domain/value-objects/participant-source-id';

/**
 * Type for the findOne method interface within repository
 */
export type ParticipantSourceFindMethod = (
  value: ParticipantSourceIdentifierValue
) => TaskEither<Error, ParticipantSource>;

export abstract class ParticipantSourceRepository {
  /**
   * Object lookup for findMethods
   */
  abstract findOneBy: Record<
    ParticipantSourceIdentifier,
    ParticipantSourceFindMethod
  >;

  /**
   * Find a participant
   *
   * This method will accept a participant identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOne(
    identifier: ParticipantSourceIdentifier
  ): ParticipantSourceFindMethod;

  /**
   * Find a participant by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneById(
    id: ParticipantSourceId
  ): TaskEither<Error, ParticipantSource>;
}
