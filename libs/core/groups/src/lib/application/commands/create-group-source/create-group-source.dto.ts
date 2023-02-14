import { Record, Static } from 'runtypes';
import { GroupBase } from '../../../domain/entities/group';

/**
 * Info required to create a groupSource from group
 */
export const CreateGroupSourceDto = Record({
  group: GroupBase,
});

export type CreateGroupSourceDto = Static<typeof CreateGroupSourceDto>;
