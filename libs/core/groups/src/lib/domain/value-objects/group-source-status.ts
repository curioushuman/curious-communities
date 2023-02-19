import { Literal, Static, Union } from 'runtypes';

export const GroupSourceStatusEnum = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

// TODO: get this working, to simplify the below
// const GroupSourceStatusValues = Object.keys(GroupSourceStatusEnum).map((key) => Literal(GroupSourceStatusEnum[key]));

export const GroupSourceStatus = Union(
  Literal(GroupSourceStatusEnum.PENDING),
  Literal(GroupSourceStatusEnum.ACTIVE),
  Literal(GroupSourceStatusEnum.CLOSED)
  // ...GroupSourceStatusValues
);

export type GroupSourceStatus = Static<typeof GroupSourceStatus>;
