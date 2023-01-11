import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

/**
 * GroupMember Id type specification
 *
 * Defining it here allows us to include any particular specifications if we
 * ever needed them.
 */
export const GroupMemberSourceId = ExternalId.withBrand('GroupMemberSourceId');

export type GroupMemberSourceId = Static<typeof GroupMemberSourceId>;
