import { Record, Static } from 'runtypes';
import { GroupId } from '../../../domain/value-objects/group-id';

/**
 * Input for query to find group members
 *
 * TODO:
 * - [ ] accept filters and such
 */
export const FindGroupMembersDto = Record({
  parentId: GroupId,
});

export type FindGroupMembersDto = Static<typeof FindGroupMembersDto>;
