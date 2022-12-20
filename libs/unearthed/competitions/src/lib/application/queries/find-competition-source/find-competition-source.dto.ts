import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const FindCompetitionSourceDto = Record({
  id: ExternalId,
});

export type FindCompetitionSourceDto = Static<typeof FindCompetitionSourceDto>;
