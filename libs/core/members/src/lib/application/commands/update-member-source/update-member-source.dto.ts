import { Record, Static } from 'runtypes';
import { Member } from '../../../domain/entities/member';
import { MemberSource } from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';

/**
 * Info required to create a memberSource from member
 */
export const UpdateMemberSourceDto = Record({
  source: Source,
  member: Member,
  memberSource: MemberSource,
});

export type UpdateMemberSourceDto = Static<typeof UpdateMemberSourceDto>;
