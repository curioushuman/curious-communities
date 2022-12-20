import { Static, String } from 'runtypes';

export const TrackName = String.withBrand('TrackName');

export type TrackName = Static<typeof TrackName>;
