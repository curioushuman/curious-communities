import { Static } from 'runtypes';
import { prepareEnumRuntype } from '@curioushuman/common';

/**
 * ? Should this be in a common library?
 */
export const CourseSourceStatusEnum: Record<string, string> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
  UNKNOWN: 'unknown',
} as const;

export const CourseSourceStatus = prepareEnumRuntype(CourseSourceStatusEnum);

export type CourseSourceStatus = Static<typeof CourseSourceStatus>;
