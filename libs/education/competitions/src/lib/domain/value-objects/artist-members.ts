import { Static, String } from 'runtypes';

export const ArtistMembers = String.withBrand('ArtistMembers');

export type ArtistMembers = Static<typeof ArtistMembers>;
