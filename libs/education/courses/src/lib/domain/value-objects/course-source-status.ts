import { Literal, Static, Union } from 'runtypes';

export const CourseSourceStatus = Union(
  Literal('pending'),
  Literal('open'),
  Literal('closed')
);

export type CourseSourceStatus = Static<typeof CourseSourceStatus>;
