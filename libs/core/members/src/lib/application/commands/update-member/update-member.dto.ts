import { Record, Static } from 'runtypes';

import { MemberIdExternal } from '../../../domain/value-objects/member-id-external';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateMemberDto = Record({
  externalId: MemberIdExternal,
});

export type UpdateMemberDto = Static<typeof UpdateMemberDto>;
