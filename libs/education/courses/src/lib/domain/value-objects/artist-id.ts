import { Static } from 'runtypes';

import { ExternalId } from '@curioushuman/common';

export const ArtistId = ExternalId.withBrand('ArtistId');

export type ArtistId = Static<typeof ArtistId>;
