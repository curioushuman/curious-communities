import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const MemberOrganisationName = NotEmptyString.withBrand(
  'MemberOrganisationName'
);

export type MemberOrganisationName = Static<typeof MemberOrganisationName>;
