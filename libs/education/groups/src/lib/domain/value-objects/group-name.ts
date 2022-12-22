import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const GroupName = NotEmptyString.withBrand('GroupName');

export type GroupName = Static<typeof GroupName>;
