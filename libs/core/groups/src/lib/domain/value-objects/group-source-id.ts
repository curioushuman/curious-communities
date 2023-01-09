import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

/**
 * Group Id type specification
 *
 * Defining it here allows us to include any particular specifications if we
 * ever needed them.
 */
export const GroupSourceId = ExternalId.withBrand('GroupSourceId');

export type GroupSourceId = Static<typeof GroupSourceId>;
