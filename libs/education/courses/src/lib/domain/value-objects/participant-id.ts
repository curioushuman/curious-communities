import { Static } from 'runtypes';

import { createInternalId, InternalId } from '@curioushuman/common';

export const ParticipantId = InternalId.withBrand('ParticipantId');

export type ParticipantId = Static<typeof ParticipantId>;

/**
 * This is here as a layer of abstraction to allow us to change the
 * implementation of the ID at a later date.
 */
export const createParticipantId = (): InternalId => {
  return createInternalId();
};
