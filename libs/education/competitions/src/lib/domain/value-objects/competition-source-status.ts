import { Literal, Static, Union } from 'runtypes';

export const CompetitionSourceStatus = Union(
  Literal('pending'),
  Literal('ready'),
  Literal('open')
);

export type CompetitionSourceStatus = Static<typeof CompetitionSourceStatus>;
