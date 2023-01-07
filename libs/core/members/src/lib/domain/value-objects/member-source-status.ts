import { Literal, Static, Union } from 'runtypes';

export const MemberSourceStatus = Union(
  Literal('pending'),
  Literal('registered'),
  Literal('cancelled')
);

export type MemberSourceStatus = Static<typeof MemberSourceStatus>;
