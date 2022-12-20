import { Optional, Record, Static } from 'runtypes';

import { ResultId } from '../value-objects/result-id';
import { Track } from './track';
import { ArtistSubGroup } from '../value-objects/artist-sub-group';
import { CompetitionId } from '../value-objects/competition-id';
import { ResultStatus } from '../value-objects/result-status';
import { Artist } from './artist';
import { GeoLocationResult } from '../value-objects/geo-location';

export const ResultSource = Record({
  id: ResultId,
  competitionId: CompetitionId,
  status: ResultStatus,
  artist: Artist,
  track: Optional(Track),
  location: Optional(GeoLocationResult),
  subGroup: Optional(ArtistSubGroup),
});

export type ResultSource = Static<typeof ResultSource>;
