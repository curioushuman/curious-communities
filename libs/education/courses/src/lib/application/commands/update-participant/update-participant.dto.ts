import { Optional, Record, Static } from 'runtypes';
import { Participant } from '../../../domain/entities/participant';
import { ParticipantSource } from '../../../domain/entities/participant-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateParticipantDto = Record({
  participant: Participant,
  participantSource: Optional(ParticipantSource),
});

export type UpdateParticipantDto = Static<typeof UpdateParticipantDto>;
