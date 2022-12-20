import { Boolean, Optional, Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { CompetitionId } from '../value-objects/competition-id';
import { EntryId } from '../value-objects/entry-id';
import { Artist } from './artist';
import { Track } from './track';
import { EntryStatus } from '../value-objects/entry-status';

export const Entry = Record({
  id: EntryId,
  competitionId: CompetitionId,
  status: EntryStatus,
  artist: Artist,
  track: Optional(Track),
  dateLatestUpload: Timestamp,
  eligibleByDate: Boolean,
});

export type Entry = Static<typeof Entry>;
