import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const ParticipantId = ExternalId.withBrand('ParticipantId');

export type ParticipantId = Static<typeof ParticipantId>;
