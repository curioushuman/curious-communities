import { Static } from 'runtypes';

import { InternalId } from '@curioushuman/common';

export const MemberId = InternalId.withBrand('MemberId');

export type MemberId = Static<typeof MemberId>;
