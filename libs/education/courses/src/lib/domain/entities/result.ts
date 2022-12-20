import { Optional, Record, Static } from 'runtypes';

import { CourseId } from '../value-objects/course-id';
import { ResultId } from '../value-objects/result-id';
import { Artist } from './artist';
import { Track } from './track';
import { ResultStatus } from '../value-objects/result-status';
import { GeoLocationResult } from '../value-objects/geo-location';
import { ArtistSubGroup } from '../value-objects/artist-sub-group';

export const Result = Record({
  id: ResultId,
  courseId: CourseId,
  status: ResultStatus,
  artist: Artist,
  track: Optional(Track),
  location: Optional(GeoLocationResult),
  subGroup: Optional(ArtistSubGroup),
});

export type Result = Static<typeof Result>;
