import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';

/**
 * Similar to external, but we fold registered into pending
 */
export const ParticipantStatusEnum: Record<string, string> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  UNKNOWN: 'unknown',
} as const;
export const ParticipantStatus = prepareEnumRuntype(ParticipantStatusEnum);

export type ParticipantStatus = Static<typeof ParticipantStatus>;
