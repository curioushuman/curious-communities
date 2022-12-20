import { Static } from 'runtypes';

import { InternalId, createInternalId } from '@curioushuman/common';

export const EntryId = InternalId.withBrand('EntryId');

export type EntryId = Static<typeof EntryId>;

export const createEntryId = (): EntryId => {
  return EntryId.check(createInternalId());
};
