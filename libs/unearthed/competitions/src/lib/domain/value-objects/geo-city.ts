import { Static, String } from 'runtypes';

export const GeoCity = String.withBrand('GeoCity');

export type GeoCity = Static<typeof GeoCity>;
