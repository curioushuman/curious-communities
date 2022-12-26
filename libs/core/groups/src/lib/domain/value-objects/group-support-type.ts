import { Literal, Static, Union } from 'runtypes';

export const GroupSupportType = Union(
  Literal('facilitated'),
  Literal('semi-facilitated'),
  Literal('supported'),
  Literal('unsupported')
);

export type GroupSupportType = Static<typeof GroupSupportType>;
