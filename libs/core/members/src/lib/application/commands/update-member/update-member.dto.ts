import { Record, Static } from 'runtypes';
import { Member } from '../../../domain/entities/member';
import { MemberSource } from '../../../domain/entities/member-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const UpdateMemberDto = Record({
  member: Member,
  memberSource: MemberSource,
});

export type UpdateMemberDto = Static<typeof UpdateMemberDto>;
