import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const GroupSourceId = ExternalId.withBrand('GroupSourceId');

export type GroupSourceId = Static<typeof GroupSourceId>;
