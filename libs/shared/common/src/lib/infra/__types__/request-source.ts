import { Static } from 'runtypes';
import { prepareEnumRuntype } from '../../domain/value-objects';

export const RequestSourceEnum = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
} as const;

export const RequestSource = prepareEnumRuntype(RequestSourceEnum);

export type RequestSource = Static<typeof RequestSource>;
