import { Array, Record, Static } from 'runtypes';

import { ArtistBio } from './artist-bio';
import { ArtistMembers } from './artist-members';
import { ArtistSoundsLike } from './artist-sounds-like';
import { Genre } from './genre';

export const ArtistDetails = Record({
  bio: ArtistBio,
  soundsLike: ArtistSoundsLike,
  members: ArtistMembers,
  genres: Array(Genre),
});

export type ArtistDetails = Static<typeof ArtistDetails>;
