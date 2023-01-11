import { Static } from 'runtypes';

import { NotEmptyString } from '@curioushuman/common';

export const GroupMemberOrganisationName = NotEmptyString.withBrand(
  'GroupMemberOrganisationName'
);

export type GroupMemberOrganisationName = Static<
  typeof GroupMemberOrganisationName
>;
