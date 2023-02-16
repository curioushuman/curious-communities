import { Record, Static, String } from 'runtypes';
import { MemberDto } from './member.dto';
import { StandardGroupBaseResponseDto } from './standard-group.response.dto';

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export const StandardGroupMemberBaseResponseDto = Record({
  _type: String,
  id: String,
  memberId: String,
  groupId: String,
  status: String,
  accountOwner: String,
});

/**
 * Base type for response DTO
 *
 * i.e. just the fields
 */
export type StandardGroupMemberBaseResponseDto = Static<
  typeof StandardGroupMemberBaseResponseDto
>;

/**
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * i.e. fields + relationships
 */

export const StandardGroupMemberResponseDto =
  StandardGroupMemberBaseResponseDto.extend({
    group: StandardGroupBaseResponseDto,
    member: MemberDto,
  });

/**
 * DTO that accepts any of the identifiers
 */
export type StandardGroupMemberResponseDto = Static<
  typeof StandardGroupMemberResponseDto
>;
