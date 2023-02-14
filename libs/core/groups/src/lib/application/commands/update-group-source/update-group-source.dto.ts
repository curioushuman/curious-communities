import { Record, Static } from 'runtypes';
import { GroupBase } from '../../../domain/entities/group';
import { GroupSource } from '../../../domain/entities/group-source';

/**
 * Info required to create a groupSource from group
 */
export const UpdateGroupSourceDto = Record({
  group: GroupBase,
  groupSource: GroupSource,
});

export type UpdateGroupSourceDto = Static<typeof UpdateGroupSourceDto>;
