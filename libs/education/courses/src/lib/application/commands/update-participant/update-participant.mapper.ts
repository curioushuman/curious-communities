import { UpdateMapper } from '@curioushuman/common';

import { ParticipantSource } from '../../../domain/entities/participant-source';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantMapper as DomainParticipantMapper } from '../../../domain/mappers/participant.mapper';
// import { ParticipantMapper as InfraParticipantMapper } from '../../../infra/participant.mapper';
// import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
// import { UpdateParticipantDto } from './update-participant.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateParticipantMapper extends UpdateMapper {
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
      return {
        ...participant,
        status: DomainParticipantMapper.fromSourceStatus(source.status),
      };
    };
  }
}
