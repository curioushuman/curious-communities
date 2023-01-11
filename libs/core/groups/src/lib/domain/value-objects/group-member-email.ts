import { Static } from 'runtypes';

import { Email } from '@curioushuman/common';

export const GroupMemberEmail = Email.withBrand('GroupMemberEmail');

export type GroupMemberEmail = Static<typeof GroupMemberEmail>;
