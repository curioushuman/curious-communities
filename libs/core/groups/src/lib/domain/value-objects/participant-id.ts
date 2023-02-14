import { Static } from 'runtypes';

import { InternalId } from '@curioushuman/common';

export const ParticipantId = InternalId.withBrand('ParticipantId');

export type ParticipantId = Static<typeof ParticipantId>;
