import { Record, Static } from 'runtypes';
import { GroupMemberForIdentify } from '../../../domain/entities/group-member';

/**
 * DTO for updating a course group member
 *
 * NOTES
 * We won't have access to the group member id
 */
export const UpdateCourseGroupMemberDto = Record({
  groupMember: GroupMemberForIdentify,
});

/**
 * DTO for updating a course group member
 */
export type UpdateCourseGroupMemberDto = Static<
  typeof UpdateCourseGroupMemberDto
>;
