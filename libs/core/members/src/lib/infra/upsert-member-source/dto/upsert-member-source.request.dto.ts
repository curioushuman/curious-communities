import { Record, Static, String } from 'runtypes';
import { MemberResponseDto } from '../../dto/member.response.dto';

/**
 * Externally facing DTO for upsert function
 *
 * TODO
 * - [ ] find a better way for this module to know what source it uses
 */

export const UpsertMemberSourceRequestDto = Record({
  source: String,
  member: MemberResponseDto,
});

export type UpsertMemberSourceRequestDto = Static<
  typeof UpsertMemberSourceRequestDto
>;
