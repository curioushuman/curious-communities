import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const ParticipantOrganisationName = NotEmptyString.withBrand(
  'ParticipantOrganisationName'
);

export type ParticipantOrganisationName = Static<
  typeof ParticipantOrganisationName
>;
