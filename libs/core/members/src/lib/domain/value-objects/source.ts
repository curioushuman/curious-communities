import { Literal, Static, Union } from 'runtypes';

/**
 * Similar to MemberId you have the ability to simply pick up
 * the basic Literal Union (from ExternalSource), or you can define
 * something specific for this particular use case.
 *
 * NOTE: the source references should be
 * - singular, not plural e.g. COURSE
 * - generic, not specific software e.g. COURSE, not SF_COURSE
 */
export const Source = Union(
  Literal('CRM'),
  Literal('AUTH'),
  Literal('COMMUNITY'),
  Literal('MICRO-COURSE'),
  Literal('COURSE')
);

export type Source = Static<typeof Source>;
