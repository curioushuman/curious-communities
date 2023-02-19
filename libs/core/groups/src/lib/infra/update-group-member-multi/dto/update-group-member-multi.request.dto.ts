import { Null, Optional, Record, Static } from 'runtypes';
import { GroupMemberForMultiUpdate } from '../../../domain/entities/group-member';
import { GroupBaseResponseDto } from '../../dto/group-response.dto';

/**
 * Externally facing DTO for update members of group
 */
export const UpdateGroupMemberMultiRequestDto = Record({
  groupMemberUpdate: Optional(GroupMemberForMultiUpdate.Or(Null)),
  group: GroupBaseResponseDto,
  // group: Union(GroupBaseResponseDto, GroupResponseDto),
});

export type UpdateGroupMemberMultiRequestDto = Static<
  typeof UpdateGroupMemberMultiRequestDto
>;
