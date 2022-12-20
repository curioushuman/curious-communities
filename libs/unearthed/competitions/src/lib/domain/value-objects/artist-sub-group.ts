import { Static, String } from 'runtypes';

export const ArtistSubGroup = String.withBrand('ArtistSubGroup');

export type ArtistSubGroup = Static<typeof ArtistSubGroup>;
