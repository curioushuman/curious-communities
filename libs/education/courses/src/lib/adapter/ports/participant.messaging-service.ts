import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UpdateParticipantRequestDto } from '../../infra/update-participant/dto/update-participant.request.dto';

/**
 * This allows us to define a type for the acceptable message formats
 */
export type ParticipantMessage = UpdateParticipantRequestDto;

/**
 * A repository for member source messaging
 */
export abstract class ParticipantMessagingService {
  /**
   * Send a batch of messages
   */
  abstract sendMessageBatch(
    messages: ParticipantMessage[]
  ): TaskEither<Error, void>;
}
