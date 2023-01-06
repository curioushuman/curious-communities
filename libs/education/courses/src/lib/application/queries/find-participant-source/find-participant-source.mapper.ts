import {
  parseExternalIdSourceValue,
  prepareExternalIdSource,
} from '@curioushuman/common';

import { FindParticipantSourceDto } from './find-participant-source.dto';
import { FindParticipantSourceRequestDto } from '../../../infra/find-participant-source/dto/find-participant-source.request.dto';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindParticipantSourceMapper {
  public static fromFindRequestDto(
    dto: FindParticipantSourceRequestDto
  ): FindParticipantSourceDto {
    // this will throw an error if the value is not valid
    parseExternalIdSourceValue(dto.idSourceValue, ParticipantSourceId, Source);
    const idSource = prepareExternalIdSource(
      dto.idSourceValue,
      ParticipantSourceId,
      Source
    );
    return {
      id: idSource.id,
    } as FindParticipantSourceDto;
  }
}
