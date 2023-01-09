import { Literal, Static, Union } from 'runtypes';

export const GroupType = Union(Literal('standard'), Literal('course'));

export type GroupType = Static<typeof GroupType>;
