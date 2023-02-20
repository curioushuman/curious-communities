import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';
import { GroupMemberStatusEnum } from './group-member-status';

/**
 * For now, we're going to align the external with the internal
 * As there is actually NO external status
 */
export const GroupMemberSourceStatusEnum = GroupMemberStatusEnum;

export const GroupMemberSourceStatus = prepareEnumRuntype(
  GroupMemberSourceStatusEnum
);

export type GroupMemberSourceStatus = Static<typeof GroupMemberSourceStatus>;
