import { Static, String } from 'runtypes';

export const GeoState = String.withBrand('GeoState');

export type GeoState = Static<typeof GeoState>;
