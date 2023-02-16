import { Literal, Static, Union } from 'runtypes';

export const MemberStatus = Union(
  Literal('pending'),
  Literal('active'),
  Literal('cancelled')
);

export type MemberStatus = Static<typeof MemberStatus>;
