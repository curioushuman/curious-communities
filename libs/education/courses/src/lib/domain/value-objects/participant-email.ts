import { Static } from 'runtypes';

import { Email } from '@curioushuman/common';

export const ParticipantEmail = Email.withBrand('ParticipantEmail');

export type ParticipantEmail = Static<typeof ParticipantEmail>;
