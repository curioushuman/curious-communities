import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const FindGroupSourceDto = Record({
  id: ExternalId,
});

export type FindGroupSourceDto = Static<typeof FindGroupSourceDto>;
