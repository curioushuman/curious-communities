import { Static } from 'runtypes';

import { createInternalId, InternalId } from '@curioushuman/common';

export const MemberId = InternalId.withBrand('MemberId');

export type MemberId = Static<typeof MemberId>;

/**
 * This is here as a layer of abstraction to allow us to change the
 * implementation of the ID at a later date.
 */
export const createMemberId = (): InternalId => {
  return createInternalId();
};
