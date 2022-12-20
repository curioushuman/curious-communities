import { Literal, Static, Union } from 'runtypes';

export const ResultStatus = Union(
  Literal('Long-list'),
  Literal('Short-list'),
  Literal('Finalist'),
  Literal('Winner')
);

export type ResultStatus = Static<typeof ResultStatus>;
