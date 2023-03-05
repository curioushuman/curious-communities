import { Optional, Record, Static } from 'runtypes';
import { GroupMemberFilters } from '../../../domain/entities/group-member';
import { GroupId } from '../../../domain/value-objects/group-id';

/**
 * Input for query to find group members
 *
 * TODO:
 * - [ ] accept filters and such
 */
export const FindGroupMembersDto = Record({
  parentId: Optional(GroupId),
  filters: Optional(GroupMemberFilters),
}).withConstraint((dto) => !!(dto.parentId || dto.filters));

export type FindGroupMembersDto = Static<typeof FindGroupMembersDto>;
