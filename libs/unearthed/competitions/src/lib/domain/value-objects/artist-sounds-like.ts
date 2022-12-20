import { Static, String } from 'runtypes';

export const ArtistSoundsLike = String.withBrand('ArtistSoundsLike');

export type ArtistSoundsLike = Static<typeof ArtistSoundsLike>;
