import { Literal, Static, Union } from 'runtypes';

export const CourseSourceStatus = Union(
  Literal('pending'),
  Literal('ready'),
  Literal('open')
);

export type CourseSourceStatus = Static<typeof CourseSourceStatus>;
