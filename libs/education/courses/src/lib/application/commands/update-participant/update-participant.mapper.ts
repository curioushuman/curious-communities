import { UpdateParticipantDto } from './update-participant.dto';
import { UpdateParticipantRequestDto } from '../../../infra/update-participant/dto/update-participant.request.dto';
import { FindParticipantSourceDto } from '../../queries/find-participant-source/find-participant-source.dto';
import { FindParticipantDto } from '../../queries/find-participant/find-participant.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateParticipantMapper {
  public static fromRequestDto(
    dto: UpdateParticipantRequestDto
  ): UpdateParticipantDto {
    return UpdateParticipantDto.check({
      id: dto.id,
    });
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
      identifier: 'id',
      value: dto.id,
    } as FindParticipantDto;
  }
}
