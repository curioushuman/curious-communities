import { Static, String } from 'runtypes';

export const GeoAuroraRegion = String.withBrand('GeoAuroraRegion');

export type GeoAuroraRegion = Static<typeof GeoAuroraRegion>;
