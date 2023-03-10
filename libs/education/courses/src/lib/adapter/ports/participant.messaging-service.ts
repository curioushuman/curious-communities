import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UpdateParticipantRequestDto } from '../../infra/update-participant/dto/update-participant.request.dto';
import { UpsertParticipantRequestDto } from '../../infra/upsert-participant/dto/upsert-participant.request.dto';

/**
 * This allows us to define a type for the acceptable message formats
 */
export type ParticipantMessage =
  | UpdateParticipantRequestDto
  | UpsertParticipantRequestDto;

/**
 * A repository for member source messaging
 */
export abstract class ParticipantMessagingService {
  /**
   * Update participants
   */
  abstract updateParticipants(
    messages: UpdateParticipantRequestDto[]
  ): TaskEither<Error, void>;

  /**
   * Upsert participants
   */
  abstract upsertParticipants(
    messages: UpsertParticipantRequestDto[]
  ): TaskEither<Error, void>;
}
