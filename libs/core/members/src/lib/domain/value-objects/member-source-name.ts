import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const MemberSourceName = NotEmptyString.withBrand('MemberSourceName');

export type MemberSourceName = Static<typeof MemberSourceName>;
