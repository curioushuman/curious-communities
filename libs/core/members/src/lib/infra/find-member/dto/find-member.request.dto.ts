import { Optional, Record, Static, String } from 'runtypes';

/**
 * Externally facing DTO for find function
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

/**
 * DTO that accepts any of the identifiers
 */
export const FindMemberRequestDto = Record({
  id: Optional(String),
  idSourceValue: Optional(String),
  email: Optional(String),
}).withConstraint((dto) => !!(dto.id || dto.idSourceValue || dto.email));

/**
 * DTO that accepts any of the identifiers
 */
export type FindMemberRequestDto = Static<typeof FindMemberRequestDto>;
