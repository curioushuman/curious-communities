import { Literal, Static, Union } from 'runtypes';

export const ParticipantSourceStatus = Union(
  Literal('pending'),
  Literal('registered'),
  Literal('cancelled'),
  Literal('attended'),
  Literal('unknown')
);

export type ParticipantSourceStatus = Static<typeof ParticipantSourceStatus>;
