import { Literal, Static, Union } from 'runtypes';

export const CourseSupportType = Union(
  Literal('facilitated'),
  Literal('semi-facilitated'),
  Literal('supported'),
  Literal('unsupported')
);

export type CourseSupportType = Static<typeof CourseSupportType>;
