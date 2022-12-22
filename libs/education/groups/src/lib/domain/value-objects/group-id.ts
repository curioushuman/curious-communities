import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const GroupId = ExternalId.withBrand('GroupId');

export type GroupId = Static<typeof GroupId>;
