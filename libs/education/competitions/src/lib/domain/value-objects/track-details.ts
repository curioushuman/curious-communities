import { Array, Record, Static } from 'runtypes';

import { Genre } from './genre';

export const TrackDetails = Record({
  genres: Array(Genre),
});

export type TrackDetails = Static<typeof TrackDetails>;
