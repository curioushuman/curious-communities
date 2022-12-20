import { Array, Record, Static } from 'runtypes';

import { ArtistId } from '../value-objects/artist-id';
import { ArtistName } from '../value-objects/artist-name';
import { ArtistSubGroup } from '../value-objects/artist-sub-group';
import { ArtistDetails } from '../value-objects/artist-details';
import { GeoLocation } from '../value-objects/geo-location';
import { Track } from './track';

export const Artist = Record({
  id: ArtistId,
  name: ArtistName,
  details: ArtistDetails,
  tracks: Array(Track),
  location: GeoLocation,
  subGroups: Array(ArtistSubGroup),
});

export type Artist = Static<typeof Artist>;
