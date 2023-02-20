import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';

/**
 * ? Should this be in a common library?
 */
export const MemberSourceStatusEnum: Record<string, string> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  UNKNOWN: 'unknown',
} as const;

export const MemberSourceStatus = prepareEnumRuntype(MemberSourceStatusEnum);

export type MemberSourceStatus = Static<typeof MemberSourceStatus>;
