import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const FindParticipantSourceDto = Record({
  id: ExternalId,
});

export type FindParticipantSourceDto = Static<typeof FindParticipantSourceDto>;
