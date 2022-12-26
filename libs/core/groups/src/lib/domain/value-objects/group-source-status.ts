import { Literal, Static, Union } from 'runtypes';

export const GroupSourceStatus = Union(
  Literal('pending'),
  Literal('ready'),
  Literal('open')
);

export type GroupSourceStatus = Static<typeof GroupSourceStatus>;
