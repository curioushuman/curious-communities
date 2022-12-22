import { Record, Static } from 'runtypes';

import { ParticipantId } from '../../../domain/value-objects/participant-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateParticipantDto = Record({
  id: ParticipantId,
});

export type UpdateParticipantDto = Static<typeof UpdateParticipantDto>;
