import { Literal, Static } from 'runtypes';

/**
 * Similar to ParticipantId you have the ability to simply pick up
 * the basic Literal Union, or you can define something specific
 * for this particular use case.
 *
 * NOTE: the source references should be
 * - singular, not plural e.g. COURSE
 * - generic, not specific software e.g. COURSE, not SF_COURSE
 */
export const Source = Literal('COURSE');

export type Source = Static<typeof Source>;
