import { Array, Record, Static, String } from 'runtypes';
import { StandardGroupMemberBaseResponseDto } from './standard-group-member.response.dto';

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export const StandardGroupBaseResponseDto = Record({
  _type: String,
  id: String,

  sourceIds: Array(String),

  slug: String,
  status: String,
  name: String,
  accountOwner: String,
});

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export type StandardGroupBaseResponseDto = Static<
  typeof StandardGroupBaseResponseDto
>;

/**
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * i.e. fields + relationships
 */

export const StandardGroupResponseDto = StandardGroupBaseResponseDto.extend({
  groupMembers: Array(StandardGroupMemberBaseResponseDto),
});

/**
 * DTO that accepts any of the identifiers
 */
export type StandardGroupResponseDto = Static<typeof StandardGroupResponseDto>;
