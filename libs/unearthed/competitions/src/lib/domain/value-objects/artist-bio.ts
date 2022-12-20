import { Static, String } from 'runtypes';

export const ArtistBio = String.withBrand('ArtistBio');

export type ArtistBio = Static<typeof ArtistBio>;
