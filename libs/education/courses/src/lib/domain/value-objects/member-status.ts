import { prepareEnumRuntype } from '@curioushuman/common';
import { Static } from 'runtypes';

/**
 * ? Should this be in a common library?
 */
export const MemberStatusEnum: Record<string, string> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  UNKNOWN: 'unknown',
} as const;

export const MemberStatus = prepareEnumRuntype(MemberStatusEnum);

export type MemberStatus = Static<typeof MemberStatus>;
