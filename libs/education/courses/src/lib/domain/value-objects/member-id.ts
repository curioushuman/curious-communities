import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const MemberId = ExternalId.withBrand('MemberId');

export type MemberId = Static<typeof MemberId>;
