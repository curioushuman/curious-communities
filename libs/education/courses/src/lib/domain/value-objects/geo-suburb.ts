import { Static, String } from 'runtypes';

export const GeoSuburb = String.withBrand('GeoSuburb');

export type GeoSuburb = Static<typeof GeoSuburb>;
