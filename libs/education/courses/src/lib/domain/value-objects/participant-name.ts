import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const ParticipantName = NotEmptyString.withBrand('ParticipantName');

export type ParticipantName = Static<typeof ParticipantName>;
