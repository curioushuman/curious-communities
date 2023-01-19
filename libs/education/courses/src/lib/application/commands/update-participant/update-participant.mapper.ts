import { ParticipantSource } from '../../../domain/entities/participant-source';
import { Participant } from '../../../domain/entities/participant';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateParticipantMapper {
  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing course, and the source that will be overriding it
   *
   * NOTE: we only update very little from the source
   */
  public static fromSourceToParticipant(
    participant: Participant
  ): (source: ParticipantSource) => Participant {
    return (source: ParticipantSource) => {
      return Participant.check({
        ...participant,
        status: source.status,
      });
    };
  }
}
