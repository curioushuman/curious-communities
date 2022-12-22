import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantRequestDto } from '../../../infra/create-participant/dto/create-participant.request.dto';
import { FindParticipantSourceDto } from '../../queries/find-participant-source/find-participant-source.dto';
import { FindParticipantDto } from '../../queries/find-participant/find-participant.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateParticipantMapper {
  public static fromRequestDto(
    dto: CreateParticipantRequestDto
  ): CreateParticipantDto {
    return CreateParticipantDto.check({
      id: dto.id,
    });
  }

  public static toFindParticipantSourceDto(
    dto: CreateParticipantDto
  ): FindParticipantSourceDto {
    return FindParticipantSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindParticipantDto(
    dto: CreateParticipantDto
  ): FindParticipantDto {
    return {
      identifier: 'id',
      value: dto.id,
    } as FindParticipantDto;
  }
}
