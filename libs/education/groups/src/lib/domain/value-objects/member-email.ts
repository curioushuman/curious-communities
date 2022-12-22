import { Static } from 'runtypes';

import { Email } from '@curioushuman/common';

export const MemberEmail = Email.withBrand('MemberEmail');

export type MemberEmail = Static<typeof MemberEmail>;
