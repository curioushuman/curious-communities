import { Static } from 'runtypes';

import { InternalId } from '@curioushuman/common';

/**
 * NOTES
 * This is currently duplicated from education/courses
 * The reason being is to keep coupling down... Bit of a double edged sword
 * I need to consider further which is the best approach
 */

export const ParticipantId = InternalId.withBrand('ParticipantId');

export type ParticipantId = Static<typeof ParticipantId>;
