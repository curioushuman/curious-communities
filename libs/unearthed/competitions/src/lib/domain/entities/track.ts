import { Timestamp } from '@curioushuman/common';
import { Record, Static } from 'runtypes';

import { TrackId } from '../value-objects/track-id';
import { TrackName } from '../value-objects/track-name';
import { TrackType } from '../value-objects/track-type';
import { TrackDetails } from '../value-objects/track-details';

export const Track = Record({
  id: TrackId,
  name: TrackName,
  dateUploaded: Timestamp,
  type: TrackType,
  details: TrackDetails,
});

export type Track = Static<typeof Track>;
