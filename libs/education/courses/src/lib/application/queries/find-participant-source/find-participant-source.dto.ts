import { Record, Static } from 'runtypes';

import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';

export const FindParticipantSourceDto = Record({
  id: ParticipantSourceId,
});

export type FindParticipantSourceDto = Static<typeof FindParticipantSourceDto>;
