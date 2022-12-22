import { Record, Static } from 'runtypes';

import { GroupMemberSourceStatus } from '../value-objects/group-member-source-status';
import { GroupMemberId } from '../value-objects/group-member-id';
import { MemberId } from '../value-objects/member-id';
import { GroupId } from '../value-objects/group-id';
import { MemberName } from '../value-objects/member-name';
import { MemberEmail } from '../value-objects/member-email';
import { MemberOrganisationName } from '../value-objects/member-organisation-name';

export const GroupMemberSource = Record({
  id: GroupMemberId,
  memberId: MemberId,
  groupId: GroupId,
  status: GroupMemberSourceStatus,

  memberName: MemberName,
  memberEmail: MemberEmail,
  memberOrganisationName: MemberOrganisationName,
});

export type GroupMemberSource = Static<typeof GroupMemberSource>;
