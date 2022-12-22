import { Record, Static } from 'runtypes';

import { ParticipantId } from '../../../domain/value-objects/participant-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateParticipantDto = Record({
  id: ParticipantId,
});

export type CreateParticipantDto = Static<typeof CreateParticipantDto>;
