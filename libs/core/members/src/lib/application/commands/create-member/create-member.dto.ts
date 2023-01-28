import { Record, Static } from 'runtypes';
import { MemberSource } from '../../../domain/entities/member-source';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateMemberDto = Record({
  memberSource: MemberSource,
});

export type CreateMemberDto = Static<typeof CreateMemberDto>;
