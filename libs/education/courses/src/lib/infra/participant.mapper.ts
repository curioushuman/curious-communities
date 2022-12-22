import { ParticipantResponseDto } from './dto/participant.response.dto';
import { Participant } from '../domain/entities/participant';

/**
 * TODO
 * - Should we do more checking of ParticipantResponseDto?
 */
export class ParticipantMapper {
  public static toResponseDto(
    participant: Participant
  ): ParticipantResponseDto {
    return {
      id: participant.id,
      memberId: participant.memberId,
      courseId: participant.courseId,
      status: participant.status,
      memberName: participant.memberName,
      memberEmail: participant.memberEmail,
      memberOrganisationName: participant.memberOrganisationName,
    } as ParticipantResponseDto;
  }
}
