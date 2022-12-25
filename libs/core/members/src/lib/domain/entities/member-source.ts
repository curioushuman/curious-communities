import { Record, Static } from 'runtypes';

import { MemberSourceStatus } from '../value-objects/member-source-status';
import { MemberIdExternal } from '../value-objects/member-id-external';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';

export const MemberSource = Record({
  id: MemberIdExternal,
  status: MemberSourceStatus,
  name: MemberName,
  email: MemberEmail,
  organisationName: MemberOrganisationName,
});

export type MemberSource = Static<typeof MemberSource>;
