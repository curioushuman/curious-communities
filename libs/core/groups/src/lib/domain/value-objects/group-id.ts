import { Static } from 'runtypes';

import { createInternalId, InternalId } from '@curioushuman/common';

export const GroupId = InternalId.withBrand('GroupId');

export type GroupId = Static<typeof GroupId>;

/**
 * This is here as a layer of abstraction to allow us to change the
 * implementation of the ID at a later date.
 */
export const createGroupId = (): InternalId => {
  return createInternalId();
};
