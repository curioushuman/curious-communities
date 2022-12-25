import { Record, Static } from 'runtypes';

import { MemberIdExternal } from '../../../domain/value-objects/member-id-external';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateMemberDto = Record({
  externalId: MemberIdExternal,
});

export type CreateMemberDto = Static<typeof CreateMemberDto>;
