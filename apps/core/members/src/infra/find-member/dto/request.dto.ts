import { Optional, Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindMemberRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindMemberRequestDto = Record({
  memberId: Optional(String),
  memberEmail: Optional(String),
  memberIdSourceValue: Optional(String),
}).withConstraint((dto) => !!(dto.memberId || dto.memberIdSourceValue));

/**
 * DTO that accepts any of the identifiers
 */
export type FindMemberRequestDto = Static<typeof FindMemberRequestDto>;
