import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindParticipantSourceDto } from './find-participant-source.dto';
import { prepareParticipantExternalIdSource } from '../../../domain/entities/participant';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';
import { Source } from '../../../domain/value-objects/source';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { FindParticipantSourceRequestDto } from '../../../infra/find-participant-source/dto/find-participant-source.request.dto';

/**
 * NOTE: currently all mappers are hard coded to default source
 * if we ever move to multiple possible sources
 * draw from your other microservices e.g. groups
 * TODO
 * - find base abstract class for mappers
 */
export class FindParticipantSourceMapper {
  public static fromIdSourceValue(
    idSourceValue: string
  ): FindParticipantSourceDto {
    // this will throw an error if the value is not valid
    parseExternalIdSourceValue(idSourceValue, ParticipantSourceId, Source);
    const value = prepareParticipantExternalIdSource(idSourceValue);
    return {
      identifier: 'idSource',
      value,
      source: Source.check(value.source),
    };
  }

  public static fromFindRequestDto(
    dto: FindParticipantSourceRequestDto
  ): FindParticipantSourceDto {
    return FindParticipantSourceMapper.fromIdSourceValue(dto.idSourceValue);
  }

  public static fromUpdateParticipantRequestDto(
    dto: UpdateParticipantRequestDto
  ): FindParticipantSourceDto {
    if (!dto.idSourceValue) {
      throw new InternalRequestInvalidError('idSourceValue is required');
    }
    return FindParticipantSourceMapper.fromIdSourceValue(dto.idSourceValue);
  }
}
