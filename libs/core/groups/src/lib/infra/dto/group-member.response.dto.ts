import { Array, Record, Static, String } from 'runtypes';
import { GroupBaseResponseDto } from './group.response.dto';

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export const GroupMemberBaseResponseDto = Record({
  id: String,
  memberId: String,
  groupId: String,
  status: String,
  sourceIds: Array(String),
  name: String,
  email: String,
  organisationName: String,
  accountOwner: String,
});

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export type GroupMemberBaseResponseDto = Static<
  typeof GroupMemberBaseResponseDto
>;

/**
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * i.e. fields + relationships
 */

export const GroupMemberResponseDto = GroupMemberBaseResponseDto.extend({
  group: GroupBaseResponseDto,
});

/**
 * DTO that accepts any of the identifiers
 */
export type GroupMemberResponseDto = Static<typeof GroupMemberResponseDto>;
