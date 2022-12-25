import { Literal, Static, Union } from 'runtypes';

export const MemberSourceStatus = Union(
  Literal('pending'),
  Literal('ready'),
  Literal('open')
);

export type MemberSourceStatus = Static<typeof MemberSourceStatus>;
