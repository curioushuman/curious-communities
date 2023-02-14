import { ParticipantSourceResponseDto } from './dto/participant-source.response.dto';
import { ParticipantSource } from '../domain/entities/participant-source';

export class ParticipantSourceMapper {
  public static toResponseDto(
    participantSource: ParticipantSource
  ): ParticipantSourceResponseDto {
    return ParticipantSourceResponseDto.check({
      id: participantSource.id,
      source: participantSource.source,
      courseId: participantSource.courseId,
      memberEmail: participantSource.memberEmail,
      status: participantSource.status,
    });
  }

  public static fromResponseDto(
    dto: ParticipantSourceResponseDto
  ): ParticipantSource {
    return ParticipantSource.check({
      id: dto.id,
      source: dto.source,
      courseId: dto.courseId,
      memberEmail: dto.memberEmail,
      status: dto.status,
    });
  }
}
