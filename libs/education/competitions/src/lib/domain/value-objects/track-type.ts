import { Literal, Static, Union } from 'runtypes';

export const TrackType = Union(
  Literal('ArtistPick'),
  Literal('Default'),
  Literal('CompetitionOnly')
);

export type TrackType = Static<typeof TrackType>;
