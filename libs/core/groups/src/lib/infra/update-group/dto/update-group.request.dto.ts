import { Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

export const UpdateGroupRequestDto = Record({
  idSourceValue: String,
});

export type UpdateGroupRequestDto = Static<typeof UpdateGroupRequestDto>;
