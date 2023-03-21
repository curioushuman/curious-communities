import { Optional, Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindParticipantRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindParticipantRequestDto = Record({
  id: Optional(String),
  idSourceValue: Optional(String),
}).withConstraint((dto) => !!(dto.id || dto.idSourceValue));

/**
 * DTO that accepts any of the identifiers
 */
export type FindParticipantRequestDto = Static<
  typeof FindParticipantRequestDto
>;
