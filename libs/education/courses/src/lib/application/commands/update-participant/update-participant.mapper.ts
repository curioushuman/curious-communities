import { UpdateParticipantDto } from './update-participant.dto';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { FindParticipantSourceDto } from '../../queries/find-participant-source/find-participant-source.dto';
import { FindParticipantDto } from '../../queries/find-participant/find-participant.dto';
import {
  prepareExternalIdSource,
  prepareExternalIdSourceValue,
} from '@curioushuman/common';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';
import { Source } from '../../../domain/value-objects/source';
import { ParticipantSource } from '../../../domain/entities/participant-source';
import { Participant } from '../../../domain/entities/participant';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateParticipantMapper {
  public static fromRequestDto(
    dto: UpdateParticipantRequestDto
  ): UpdateParticipantDto {
    const parsedDto = prepareExternalIdSource(
      dto.idSourceValue,
      ParticipantSourceId,
      Source
    );
    return UpdateParticipantDto.check(parsedDto);
  }

  public static toFindParticipantSourceDto(
    dto: UpdateParticipantDto
  ): FindParticipantSourceDto {
    return FindParticipantSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindParticipantDto(
    dto: UpdateParticipantDto
  ): FindParticipantDto {
    return {
      identifier: 'idSourceValue',
      value: prepareExternalIdSourceValue(dto.id, dto.source),
    } as FindParticipantDto;
  }

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
