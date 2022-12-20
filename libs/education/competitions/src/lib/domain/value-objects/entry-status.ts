import { Literal, Static, Union } from 'runtypes';

export const EntryStatus = Union(
  Literal('unmoderated'),
  Literal('moderated'),
  Literal('updated')
);

export type EntryStatus = Static<typeof EntryStatus>;
