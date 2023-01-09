import { Record, Static, String } from 'runtypes';

import { MemberResponseDto } from '@curioushuman/cc-members-service';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: this function will only ever be called as a response to a create/update of member
 * in which case the full member object will be passed as part of the event, in the form of
 * a response DTO.
 */
export const UpsertMemberSourceRequestDto = Record({
  source: String,
  member: MemberResponseDto,
});

export type UpsertMemberSourceRequestDto = Static<
  typeof UpsertMemberSourceRequestDto
>;
