import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';

/**
 * ? Should this be in a common library?
 */
export const GroupSourceStatusEnum = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
  UNKNOWN: 'unknown',
} as const;

export const GroupSourceStatus = prepareEnumRuntype(GroupSourceStatusEnum);

export type GroupSourceStatus = Static<typeof GroupSourceStatus>;
