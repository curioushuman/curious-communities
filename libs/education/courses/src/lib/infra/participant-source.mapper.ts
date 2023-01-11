import { ParticipantSourceResponseDto } from './dto/participant-source.response.dto';
import { ParticipantSource } from '../domain/entities/participant-source';

/**
 * TODO
 * - Should we do more checking of ParticipantSourceResponseDto?
 */
export class ParticipantSourceMapper {
  public static toResponseDto(
    participantSource: ParticipantSource
  ): ParticipantSourceResponseDto {
    return {
      id: participantSource.id,
      courseId: participantSource.courseId,
      status: participantSource.status,

      name: participantSource.name,
      email: participantSource.email,
      organisationName: participantSource.organisationName,
    } as ParticipantSourceResponseDto;
  }
}
