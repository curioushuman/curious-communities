import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const FindGroupMemberSourceDto = Record({
  id: ExternalId,
});

export type FindGroupMemberSourceDto = Static<typeof FindGroupMemberSourceDto>;
