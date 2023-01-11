import { Literal, Static, Union } from 'runtypes';

export const GroupMemberSourceStatus = Union(
  Literal('pending'),
  Literal('registered'),
  Literal('cancelled')
);

export type GroupMemberSourceStatus = Static<typeof GroupMemberSourceStatus>;
