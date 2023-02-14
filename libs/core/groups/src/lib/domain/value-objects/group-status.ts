import { Literal, Static, Union } from 'runtypes';

export const GroupStatus = Union(
  Literal('pending'),
  Literal('active'),
  Literal('closed')
);

export type GroupStatus = Static<typeof GroupStatus>;
