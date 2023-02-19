import { Literal, Static, Union } from 'runtypes';
import { GroupSourceStatusEnum } from './group-source-status';

/**
 * At this stage, we're going to align the internal with the external
 */
export const GroupStatusEnum = GroupSourceStatusEnum;

// TODO: get this working, to simplify the below
// const GroupStatusValues = Object.keys(GroupStatusEnum).map((key) => Literal(GroupStatusEnum[key]));

export const GroupStatus = Union(
  Literal(GroupStatusEnum.PENDING),
  Literal(GroupStatusEnum.ACTIVE),
  Literal(GroupStatusEnum.CLOSED)
  // ...GroupStatusValues
);

export type GroupStatus = Static<typeof GroupStatus>;
