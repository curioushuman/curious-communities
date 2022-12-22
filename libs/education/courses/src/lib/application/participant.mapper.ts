import { Participant } from '../domain/entities/participant';
import { ParticipantSource } from '../domain/entities/participant-source';
import config from '../static/config';

/**
 * TODO
 * - Should we do more checking of ParticipantResponseDto?
 */
export class ParticipantMapper {
  public static fromSourceToParticipant(
    source: ParticipantSource
  ): Participant {
    return Participant.check({
      id: source.id,
      status: source.status,
      memberId: source.memberId,
      courseId: source.courseId,
      memberName: source.memberName,
      memberEmail: source.memberEmail,
      memberOrganisationName: source.memberOrganisationName,
      accountOwner: config.defaults.accountOwner,
    });
  }
}
