import { Record, Static } from 'runtypes';
import { Member } from '../../../domain/entities/member';
import { Source } from '../../../domain/value-objects/source';

/**
 * Info required to create a memberSource from member
 */
export const CreateMemberSourceDto = Record({
  source: Source,
  member: Member,
});

export type CreateMemberSourceDto = Static<typeof CreateMemberSourceDto>;
