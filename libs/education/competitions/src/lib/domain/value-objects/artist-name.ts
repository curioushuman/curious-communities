import { Static, String } from 'runtypes';

export const ArtistName = String.withBrand('ArtistName');

export type ArtistName = Static<typeof ArtistName>;
