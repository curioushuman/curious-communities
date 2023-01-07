import { Static } from 'runtypes';

import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateMemberDto =
  MemberSourceIdSource.withBrand('UpdateMemberDto');

export type UpdateMemberDto = Static<typeof UpdateMemberDto>;
