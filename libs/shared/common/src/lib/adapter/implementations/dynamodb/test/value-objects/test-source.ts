import { Literal, Static, Union } from 'runtypes';

export const TestSource = Union(Literal('ALPHA'), Literal('BETA'));

export type TestSource = Static<typeof TestSource>;
