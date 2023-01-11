import { Array, Record, Static, String } from 'runtypes';
import { GroupMemberBaseResponseDto } from './group-member.response.dto';

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export const GroupBaseResponseDto = Record({
  id: String,
  status: String,
  type: String,
  slug: String,
  sourceIds: Array(String),
  name: String,
  accountOwner: String,
});

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export type GroupBaseResponseDto = Static<typeof GroupBaseResponseDto>;

/**
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * i.e. fields + relationships
 */

export const GroupResponseDto = GroupBaseResponseDto.extend({
  members: Array(GroupMemberBaseResponseDto),
});

/**
 * DTO that accepts any of the identifiers
 */
export type GroupResponseDto = Static<typeof GroupResponseDto>;
