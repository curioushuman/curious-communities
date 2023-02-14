import { Literal, Static, Union } from 'runtypes';

export const GroupMemberSourceStatus = Union(
  Literal('pending'),
  Literal('active')
);

export type GroupMemberSourceStatus = Static<typeof GroupMemberSourceStatus>;
