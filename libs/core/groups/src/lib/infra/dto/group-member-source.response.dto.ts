import { Record, Static, String } from 'runtypes';
/**
 * This is the structure of data the rest of our applications will receive.
 */
export const GroupMemberSourceResponseDto = Record({
  source: String,
  groupId: String,
  memberId: String,
  memberEmail: String,
  status: String,
});

/**
 * This is the structure of data the rest of our applications will receive.
 */
export type GroupMemberSourceResponseDto = Static<
  typeof GroupMemberSourceResponseDto
>;
