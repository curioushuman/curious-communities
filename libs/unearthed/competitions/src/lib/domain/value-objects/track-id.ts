import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const TrackId = ExternalId.withBrand('TrackId');

export type TrackId = Static<typeof TrackId>;
