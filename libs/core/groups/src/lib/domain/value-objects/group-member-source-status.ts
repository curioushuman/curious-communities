import { Literal, Static, Union } from 'runtypes';
import { GroupMemberStatusEnum } from './group-member-status';

/**
 * For now, we're going to align the external with the internal
 * As there is actually NO external status
 */
export const GroupMemberSourceStatusEnum = GroupMemberStatusEnum;

// TODO: get this working, to simplify the below
// const GroupMemberSourceStatusValues = Object.keys(GroupMemberSourceStatusEnum).map((key) => Literal(GroupMemberSourceStatusEnum[key]));

export const GroupMemberSourceStatus = Union(
  Literal(GroupMemberSourceStatusEnum.PENDING),
  Literal(GroupMemberSourceStatusEnum.ACTIVE),
  Literal(GroupMemberSourceStatusEnum.CANCELLED)
  // ...GroupMemberSourceStatusValues
);

export type GroupMemberSourceStatus = Static<typeof GroupMemberSourceStatus>;
