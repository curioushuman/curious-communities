import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';

export const GroupMemberStatusEnum = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  UNKNOWN: 'unknown',
} as const;

export const GroupMemberStatus = prepareEnumRuntype(GroupMemberStatusEnum);

export type GroupMemberStatus = Static<typeof GroupMemberStatus>;
