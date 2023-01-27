import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindParticipantDto } from './find-participant.dto';
import {
  FindByIdSourceValueParticipantRequestDto,
  FindParticipantRequestDto,
} from '../../../infra/find-participant/dto/find-participant.request.dto';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';
import { Source } from '../../../domain/value-objects/source';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindParticipantMapper {
  public static fromFindRequestDto(
    dto: FindParticipantRequestDto
  ): FindParticipantDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    // return dto.id
    //   ? FindParticipantMapper.fromFindByIdRequestDto({
    //       id: dto.id,
    //     })
    //   : FindParticipantMapper.fromFindByIdSourceValueRequestDto({
    //       idSourceValue: dto.idSourceValue as string,
    //     });
    return FindParticipantMapper.fromFindByIdSourceValueRequestDto({
      idSourceValue: dto.idSourceValue as string,
    });
  }

  // public static fromFindByIdRequestDto(
  //   dto: FindByIdParticipantRequestDto
  // ): FindParticipantDto {
  //   // this will throw an error if the id is not valid
  //   const value = ParticipantId.check(dto.id);
  //   return {
  //     identifier: 'id',
  //     value,
  //   } as FindParticipantDto;
  // }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueParticipantRequestDto
  ): FindParticipantDto {
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      ParticipantSourceId,
      Source
    );
    return {
      identifier: 'idSourceValue',
      value,
    } as FindParticipantDto;
  }

  public static fromUpdateParticipantRequestDto(
    dto: UpdateParticipantRequestDto
  ): FindParticipantDto {
    return {
      identifier: 'idSourceValue',
      value: dto.idSourceValue,
    } as FindParticipantDto;
  }
}
