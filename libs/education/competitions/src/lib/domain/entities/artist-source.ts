import { Array, Record, Static } from 'runtypes';

import { ArtistId } from '../value-objects/artist-id';
import { ArtistName } from '../value-objects/artist-name';
import { Track } from './track';
import { ArtistBio } from '../value-objects/artist-bio';
import { ArtistSoundsLike } from '../value-objects/artist-sounds-like';
import { ArtistMembers } from '../value-objects/artist-members';
import { Genre } from '../value-objects/genre';
import { ArtistSubGroup } from '../value-objects/artist-sub-group';
import { GeoLocation } from '../value-objects/geo-location';

export const ArtistSource = Record({
  id: ArtistId,
  name: ArtistName,
  bio: ArtistBio,
  soundsLike: ArtistSoundsLike,
  members: ArtistMembers,
  genres: Array(Genre),
  subGroups: Array(ArtistSubGroup),
  tracks: Array(Track),
  location: GeoLocation,
});

export type ArtistSource = Static<typeof ArtistSource>;
