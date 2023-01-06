import { Static } from 'runtypes';

import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateParticipantDto = ParticipantSourceIdSource.withBrand(
  'UpdateParticipantDto'
);

export type UpdateParticipantDto = Static<typeof UpdateParticipantDto>;
