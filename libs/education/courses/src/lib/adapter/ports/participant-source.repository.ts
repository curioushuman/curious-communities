import { RepositoryFindBy, RepositoryFindMethod } from '@curioushuman/common';
import { TaskEither } from 'fp-ts/lib/TaskEither';

import {
  ParticipantSource,
  ParticipantSourceIdentifier,
  ParticipantSourceIdentifiers,
} from '../../domain/entities/participant-source';
import { ParticipantSourceIdSource } from '../../domain/value-objects/participant-source-id-source';

/**
 * Type for the findOne method interface within repository
 */
export type ParticipantSourceFindMethod = RepositoryFindMethod<
  ParticipantSourceIdentifiers,
  ParticipantSource
>;

export abstract class ParticipantSourceRepository
  implements RepositoryFindBy<ParticipantSourceIdentifiers, ParticipantSource>
{
  /**
   * FindBy interface
   */
  abstract findOneBy: Record<
    ParticipantSourceIdentifier,
    ParticipantSourceFindMethod
  >;
  abstract findOne(
    identifier: ParticipantSourceIdentifier
  ): ParticipantSourceFindMethod;

  /**
   * Find a participant by the given ID
   *
   * NOTE: will throw NotFoundException if not found
   */
  abstract findOneByIdSource(
    id: ParticipantSourceIdSource
  ): TaskEither<Error, ParticipantSource>;
}
