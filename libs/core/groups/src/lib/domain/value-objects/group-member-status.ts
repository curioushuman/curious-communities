import { Literal, Static, Union } from 'runtypes';

export const GroupMemberStatusEnum = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
} as const;

// TODO: get this working, to simplify the below
// const GroupMemberStatusValues = Object.keys(GroupMemberStatusEnum).map((key) => Literal(GroupMemberStatusEnum[key]));

export const GroupMemberStatus = Union(
  Literal(GroupMemberStatusEnum.PENDING),
  Literal(GroupMemberStatusEnum.ACTIVE),
  Literal(GroupMemberStatusEnum.CANCELLED)
  // ...GroupMemberStatusValues
);

export type GroupMemberStatus = Static<typeof GroupMemberStatus>;
