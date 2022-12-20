import { Static } from 'runtypes';

import { InternalId, createInternalId } from '@curioushuman/common';

export const ResultId = InternalId.withBrand('ResultId');

export type ResultId = Static<typeof ResultId>;

export const createResultId = (): ResultId => {
  return ResultId.check(createInternalId());
};
