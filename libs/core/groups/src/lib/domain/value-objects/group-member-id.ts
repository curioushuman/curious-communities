import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const GroupMemberId = ExternalId.withBrand('GroupMemberId');

export type GroupMemberId = Static<typeof GroupMemberId>;
