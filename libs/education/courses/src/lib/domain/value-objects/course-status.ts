import { Literal, Static, Union } from 'runtypes';

export const CourseStatus = Union(
  Literal('pending'),
  Literal('open'),
  Literal('closed')
);

export type CourseStatus = Static<typeof CourseStatus>;
