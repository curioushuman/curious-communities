import { Record, Static, String } from 'runtypes';
import { MemberResponseDto } from '../../dto/member.response.dto';

/**
 * Externally facing DTO for find function
 */

export const UpsertMemberSourceRequestDto = Record({
  source: String,
  member: MemberResponseDto,
});

export type UpsertMemberSourceRequestDto = Static<
  typeof UpsertMemberSourceRequestDto
>;
