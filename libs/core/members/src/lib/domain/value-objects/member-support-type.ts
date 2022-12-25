import { Literal, Static, Union } from 'runtypes';

export const MemberSupportType = Union(
  Literal('facilitated'),
  Literal('semi-facilitated'),
  Literal('supported'),
  Literal('unsupported')
);

export type MemberSupportType = Static<typeof MemberSupportType>;
