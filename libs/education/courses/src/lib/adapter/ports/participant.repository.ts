import { RepositoryFindBy, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Participant,
  ParticipantIdentifier,
  ParticipantIdentifiers,
} from '../../domain/entities/participant';
import { ParticipantSourceIdSourceValue } from '../../domain/value-objects/participant-source-id-source';

export type ParticipantFindMethod = RepositoryFindMethod<
  ParticipantIdentifiers,
  Participant
>;

/**
 * A repository for participants
 *
 * NOTES:
 * - repos for child entities, by default, ALWAYS include the parent
 */
export abstract class ParticipantRepository
  implements RepositoryFindBy<ParticipantIdentifiers, Participant>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<ParticipantIdentifier, ParticipantFindMethod>;
  abstract findOne(identifier: ParticipantIdentifier): ParticipantFindMethod;

  /**
   * Find a participant by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   *
   * ! UPDATE: removing until we've decided what to do about the fact
   * we need the courseId as well as the participantId for DynamoDb
   */
  // abstract findOneById(id: ParticipantId): TaskEither<Error, Participant>;

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
   * * This will be the pattern for children, i.e. we need entity.parent to save
   */
  abstract save(participant: Participant): TaskEither<Error, Participant>;
}
