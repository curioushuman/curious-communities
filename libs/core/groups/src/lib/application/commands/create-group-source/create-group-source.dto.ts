import { Record, Static } from 'runtypes';
import { Group } from '../../../domain/entities/group';
import { Source } from '../../../domain/value-objects/source';

/**
 * Info required to create a groupSource from group
 */
export const CreateGroupSourceDto = Record({
  source: Source,
  group: Group,
});

export type CreateGroupSourceDto = Static<typeof CreateGroupSourceDto>;
