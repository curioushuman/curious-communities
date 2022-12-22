import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const GroupSourceName = NotEmptyString.withBrand('GroupSourceName');

export type GroupSourceName = Static<typeof GroupSourceName>;
