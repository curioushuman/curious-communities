import { Record, Static } from 'runtypes';
import { ParticipantSourceResponseDto } from '../../dto/participant-source.response.dto';

/**
 * Externally facing DTO for upserting single participant from source
 *
 * NOTE: currently only used to invoke state machine by same name
 */
export const UpsertParticipantRequestDto = Record({
  participantSource: ParticipantSourceResponseDto,
});

export type UpsertParticipantRequestDto = Static<
  typeof UpsertParticipantRequestDto
>;
