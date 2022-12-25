import { Record, Static } from 'runtypes';

import { MemberIdExternal } from '../../../domain/value-objects/member-id-external';

export const FindMemberSourceDto = Record({
  id: MemberIdExternal,
});

export type FindMemberSourceDto = Static<typeof FindMemberSourceDto>;
