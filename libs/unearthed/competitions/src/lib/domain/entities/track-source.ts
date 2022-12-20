import { Timestamp } from '@curioushuman/common';
import { Array, Record, Static } from 'runtypes';
import { Genre } from '../value-objects/genre';
import { TrackId } from '../value-objects/track-id';
import { TrackName } from '../value-objects/track-name';
import { TrackType } from '../value-objects/track-type';

export const TrackSource = Record({
  id: TrackId,
  name: TrackName,
  dateUploaded: Timestamp,
  type: TrackType,
  genres: Array(Genre),
});

export type TrackSource = Static<typeof TrackSource>;
