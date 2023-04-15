import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UpsertParticipantRequestDto } from '../../infra/upsert-participant/dto/upsert-participant.request.dto';

/**
 * A repository for member source queue
 */
export abstract class ParticipantOrchestrationService {
  /**
   * Upsert Participant
   */
  abstract upsertParticipant(
    dto: UpsertParticipantRequestDto
  ): TaskEither<Error, void>;
}
