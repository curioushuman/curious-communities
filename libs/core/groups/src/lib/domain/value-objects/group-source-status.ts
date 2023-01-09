import { Literal, Static, Union } from 'runtypes';

export const GroupSourceStatus = Union(
  Literal('pending'),
  Literal('open'),
  Literal('closed')
);

export type GroupSourceStatus = Static<typeof GroupSourceStatus>;
