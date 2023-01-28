import { Record, Static } from 'runtypes';
import { Member } from '../../../domain/entities/member';

/**
 * Info required to create a memberSource from member
 */
export const CreateMemberSourceDto = Record({
  member: Member,
});

export type CreateMemberSourceDto = Static<typeof CreateMemberSourceDto>;
