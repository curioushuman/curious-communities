import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const GroupMemberName = NotEmptyString.withBrand('GroupMemberName');

export type GroupMemberName = Static<typeof GroupMemberName>;
