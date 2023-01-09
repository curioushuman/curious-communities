import { Record, Static } from 'runtypes';
import { Group } from '../../../domain/entities/group';
import { GroupSource } from '../../../domain/entities/group-source';
import { Source } from '../../../domain/value-objects/source';

/**
 * Info required to create a groupSource from group
 */
export const UpdateGroupSourceDto = Record({
  source: Source,
  group: Group,
  groupSource: GroupSource,
});

export type UpdateGroupSourceDto = Static<typeof UpdateGroupSourceDto>;
