import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

/**
 * Participant Id type specification
 *
 * Defining it here allows us to include any particular specifications if we
 * ever needed them.
 */
export const ParticipantSourceId = ExternalId.withBrand('ParticipantSourceId');

export type ParticipantSourceId = Static<typeof ParticipantSourceId>;
