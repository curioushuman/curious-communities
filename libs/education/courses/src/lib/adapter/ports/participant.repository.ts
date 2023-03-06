import { RepositoryFindOne, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  Participant,
  ParticipantFilters,
  ParticipantIdentifier,
  ParticipantIdentifiers,
} from '../../domain/entities/participant';
import { CourseId } from '../../domain/value-objects/course-id';
import { ParticipantId } from '../../domain/value-objects/participant-id';
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
 *
 * TODO:
 * - [ ] at some point this repo might need to implement a mixture of findOne and findOneWithParent
 */
export abstract class ParticipantRepository
  implements RepositoryFindOne<ParticipantIdentifiers, Participant>
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
   */
  abstract findOneById(value: ParticipantId): TaskEither<Error, Participant>;

  /**
   * Find a participant by the given ID and source value
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSourceValue(
    value: ParticipantSourceIdSourceValue
  ): TaskEither<Error, Participant>;

  /**
   * Find all participants
   */
  abstract findAll(props: {
    parentId?: CourseId;
    filters?: ParticipantFilters;
  }): TaskEither<Error, Participant[]>;

  /**
   * Create/update a participant
   *
   * NOTE: full participant, not just the base
   * * This will be the pattern for children, i.e. we need entity.parent to save
   */
  abstract save(participant: Participant): TaskEither<Error, Participant>;
}
