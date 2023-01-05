import { Literal, Static } from 'runtypes';

/**
 * This defines a list of possible sources for external IDs
 *
 * * NOTE: the source references should be
 * - singular, not plural e.g. COURSE
 * - generic, not specific software e.g. COURSE, not SF_COURSE
 */
export const ExternalSource = Literal('EXTERNAL');

export type ExternalSource = Static<typeof ExternalSource>;
