import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

/**
 * Member Id type specification
 *
 * Defining it here allows us to include any particular specifications if we
 * ever needed them.
 */
export const MemberSourceId = ExternalId.withBrand('MemberSourceId');

export type MemberSourceId = Static<typeof MemberSourceId>;
