import { ParticipantSourceResponseDto } from './dto/participant-source.response.dto';
import { ParticipantSource } from '../domain/entities/participant-source';

export class ParticipantSourceMapper {
  public static toResponseDto(
    participantSource: ParticipantSource
  ): ParticipantSourceResponseDto {
    return ParticipantSourceResponseDto.check({
      id: participantSource.id,
      courseId: participantSource.courseId,
      status: participantSource.status,

      name: participantSource.name,
      email: participantSource.email,
      organisationName: participantSource.organisationName,
    });
  }

  public static fromResponseDto(
    dto: ParticipantSourceResponseDto
  ): ParticipantSource {
    return ParticipantSource.check({
      id: dto.id,
      courseId: dto.courseId,
      status: dto.status,

      name: dto.name,
      email: dto.email,
      organisationName: dto.organisationName,
    });
  }
}
