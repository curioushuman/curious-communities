import { Record, Static } from 'runtypes';
import { MemberResponseDto } from '../../dto/member.response.dto';

/**
 * Externally facing DTO for upsert multi function
 */

export const UpsertMemberSourceMultiRequestDto = Record({
  member: MemberResponseDto,
});

export type UpsertMemberSourceMultiRequestDto = Static<
  typeof UpsertMemberSourceMultiRequestDto
>;
