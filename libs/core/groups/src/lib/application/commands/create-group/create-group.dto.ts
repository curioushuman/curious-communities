import type { FindGroupDto } from '../../queries/find-group/find-group.dto';
import type { FindGroupSourceDto } from '../../queries/find-group-source/find-group-source.dto';

/**
 * This is the form of data our repository will expect for the command
 *
 * It happens to re-use the GroupSourceIdSource type, but this is not
 * required. It is just a convenience.
 */

export type CreateGroupDto = {
  findGroupDto: FindGroupDto;
  findGroupSourceDto: FindGroupSourceDto;
};
