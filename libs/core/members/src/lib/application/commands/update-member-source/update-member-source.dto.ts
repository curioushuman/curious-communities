import { Record, Static } from 'runtypes';
import { Member } from '../../../domain/entities/member';
import { MemberSource } from '../../../domain/entities/member-source';

/**
 * Info required to create a memberSource from member
 */
export const UpdateMemberSourceDto = Record({
  member: Member,
  memberSource: MemberSource,
});

export type UpdateMemberSourceDto = Static<typeof UpdateMemberSourceDto>;
