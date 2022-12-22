import { Record, Static } from 'runtypes';

import { GroupId } from '../../../domain/value-objects/group-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateGroupDto = Record({
  id: GroupId,
});

export type CreateGroupDto = Static<typeof CreateGroupDto>;
