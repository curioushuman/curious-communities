import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const CompetitionId = ExternalId.withBrand('ParticipantId');

export type CompetitionId = Static<typeof CompetitionId>;
