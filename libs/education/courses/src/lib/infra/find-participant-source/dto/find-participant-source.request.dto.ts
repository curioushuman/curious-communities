import { Record, Static, String } from 'runtypes';

/**
 * Externally facing DTO for find function
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

export const FindParticipantSourceRequestDto = Record({
  idSourceValue: String,
});

export type FindParticipantSourceRequestDto = Static<
  typeof FindParticipantSourceRequestDto
>;
