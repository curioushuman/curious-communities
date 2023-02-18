import { Record, Static } from 'runtypes';
import { GroupMemberForMultiUpdate } from '../../../domain/entities/group-member';
import { GroupBaseResponseDto } from '../../dto/group-response.dto';

/**
 * Externally facing DTO for update members of group
 *
 * TODO:
 * - [ ] accept base or full dto
 */
export const UpdateGroupMemberMultiRequestDto = Record({
  groupMemberUpdate: GroupMemberForMultiUpdate,
  group: GroupBaseResponseDto,
  // group: Union(GroupBaseResponseDto, GroupResponseDto),
});

export type UpdateGroupMemberMultiRequestDto = Static<
  typeof UpdateGroupMemberMultiRequestDto
>;
