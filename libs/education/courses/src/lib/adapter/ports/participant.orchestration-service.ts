import { TaskEither } from 'fp-ts/lib/TaskEither';
import { ParticipantSource } from '../../domain/entities/participant-source';

/**
 * A repository for member source queue
 */
export abstract class ParticipantOrchestrationService {
  /**
   * Upsert Participant
   */
  abstract upsertParticipant(
    participantSource: ParticipantSource
  ): TaskEither<Error, void>;
}
