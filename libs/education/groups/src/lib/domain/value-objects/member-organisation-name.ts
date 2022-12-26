import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

/**
 * Member Organisation Name type specification
 *
 * NOTE: we're not storing this in a central location to keep coupling low
 * it will mean duplication but it's a small price to pay for the benefits
 */
export const MemberOrganisationName = NotEmptyString.withBrand(
  'MemberOrganisationName'
);

export type MemberOrganisationName = Static<typeof MemberOrganisationName>;
