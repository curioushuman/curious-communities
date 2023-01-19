import { FindParticipantSourceDto } from './find-participant-source.dto';
import { prepareParticipantExternalIdSource } from '../../../domain/entities/participant';
import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';
import config from '../../../static/config';
import { Source } from '../../../domain/value-objects/source';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { parseExternalIdSourceValue } from '@curioushuman/common';
import { FindParticipantSourceRequestDto } from '../../../infra/find-participant-source/dto/find-participant-source.request.dto';

/**
 * NOTE: currently all mappers are hard coded to default source
 * if we ever move to multiple possible sources
 * draw from your other microservices e.g. groups
 * TODO
 * - find base abstract class for mappers
 */
export class FindParticipantSourceMapper {
  public static fromFindRequestDto(
    dto: FindParticipantSourceRequestDto
  ): FindParticipantSourceDto {
    // this will throw an error if the value is not valid
    parseExternalIdSourceValue(dto.idSourceValue, ParticipantSourceId, Source);
    const value = prepareParticipantExternalIdSource(dto.idSourceValue);
    return {
      identifier: 'idSource',
      value,
      source: Source.check(config.defaults.primaryAccountSource),
    };
  }

  public static fromUpdateParticipantRequestDto(
    dto: UpdateParticipantRequestDto
  ): FindParticipantSourceDto {
    // this will throw an error if the value is not valid
    parseExternalIdSourceValue(dto.idSourceValue, ParticipantSourceId, Source);
    const value = prepareParticipantExternalIdSource(dto.idSourceValue);
    return {
      identifier: 'idSource',
      value,
      source: Source.check(config.defaults.primaryAccountSource),
    };
  }

  public static fromIdSourceToId(
    idSource: ParticipantSourceIdSource
  ): ParticipantSourceId {
    // this will throw an error if the id is not valid
    const parsedIdSource = ParticipantSourceIdSource.check(idSource);
    // this pulls the id out so it can be used on it's own
    return parsedIdSource.id as ParticipantSourceId;
  }
}
