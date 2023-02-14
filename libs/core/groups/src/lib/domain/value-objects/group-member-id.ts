import { Static } from 'runtypes';

import { createInternalId, InternalId } from '@curioushuman/common';

export const GroupMemberId = InternalId.withBrand('GroupMemberId');

export type GroupMemberId = Static<typeof GroupMemberId>;

/**
 * This is here as a layer of abstraction to allow us to change the
 * implementation of the ID at a later date.
 */
export const createGroupMemberId = (): GroupMemberId => {
  return createInternalId() as GroupMemberId;
};
