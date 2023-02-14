import { Record, Static, String } from 'runtypes';
/**
 * This is the structure of data the rest of our applications will receive.
 */
export const GroupMemberSourceResponseDto = Record({
  id: String,
  groupId: String,
  source: String,
  status: String,
  name: String,
  email: String,
  organisationName: String,
});

/**
 * This is the structure of data the rest of our applications will receive.
 */
export type GroupMemberSourceResponseDto = Static<
  typeof GroupMemberSourceResponseDto
>;
