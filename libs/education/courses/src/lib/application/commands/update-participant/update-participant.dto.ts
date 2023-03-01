import { Optional, Record, Static } from 'runtypes';
import {
  parseParticipant,
  Participant,
} from '../../../domain/entities/participant';
import { ParticipantSource } from '../../../domain/entities/participant-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateParticipantDto = Record({
  participant: Participant,
  participantSource: Optional(ParticipantSource),
});

export type UpdateParticipantDto = Static<typeof UpdateParticipantDto>;

/**
 * An alternative parser, instead of UpdateParticipantDto.check()
 *
 * Participant having Course and Member as children proves too much for Runtype.check()
 */
export const parseUpdateParticipantDto = (
  dto: UpdateParticipantDto
): UpdateParticipantDto => {
  const { participant, participantSource } = dto;

  return {
    participant: parseParticipant(participant),
    participantSource: participantSource
      ? ParticipantSource.check(participantSource)
      : undefined,
  };
};
