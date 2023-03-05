import { Optional, Record, Static, String } from 'runtypes';
import { RequestSource } from '@curioushuman/common';
import { MemberResponseDto } from '../../dto/member.response.dto';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

export const UpdateMemberRequestDto = Record({
  idSourceValue: Optional(String),
  member: Optional(MemberResponseDto),
  requestSource: Optional(RequestSource),
}).withConstraint((dto) => !!(dto.idSourceValue || dto.member));

export type UpdateMemberRequestDto = Static<typeof UpdateMemberRequestDto>;
