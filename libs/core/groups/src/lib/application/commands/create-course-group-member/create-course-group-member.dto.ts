import { Record, Static } from 'runtypes';
import { GroupMemberBase } from '../../../domain/entities/group-member';

/**
 * DTO for creating a course group member
 */
export const CreateCourseGroupMemberDto = Record({
  groupMember: GroupMemberBase,
});

/**
 * DTO for creating a course group member
 */
export type CreateCourseGroupMemberDto = Static<
  typeof CreateCourseGroupMemberDto
>;
