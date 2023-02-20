import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';

/**
 * ? Should this be in a common library?
 */
export const ParticipantSourceStatusEnum: Record<string, string> = {
  PENDING: 'pending',
  REGISTERED: 'registered',
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
} as const;

export const ParticipantSourceStatus = prepareEnumRuntype(
  ParticipantSourceStatusEnum
);

export type ParticipantSourceStatus = Static<typeof ParticipantSourceStatus>;
