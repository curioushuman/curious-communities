import { Record, Static, Union } from 'runtypes';

import { GeoAuroraRegion } from './geo-aurora-region';
import { GeoCity } from './geo-city';
import { GeoState } from './geo-state';
import { GeoSuburb } from './geo-suburb';

export const GeoLocation = Record({
  auroraRegion: GeoAuroraRegion,
  state: GeoState,
  city: GeoCity,
  suburb: GeoSuburb,
});

export type GeoLocation = Static<typeof GeoLocation>;

export const GeoLocationResult = Union(
  GeoAuroraRegion,
  GeoState,
  GeoCity,
  GeoSuburb
);

export type GeoLocationResult = Static<typeof GeoLocationResult>;
