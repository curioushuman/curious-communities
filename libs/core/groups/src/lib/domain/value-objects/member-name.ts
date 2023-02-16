import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const MemberName = NotEmptyString.withBrand('MemberName');

export type MemberName = Static<typeof MemberName>;
