import { Optional, Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindParticipantRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const FindParticipantSourceRequestDto = Record({
  participantIdSourceValue: String,
});

export type FindParticipantSourceRequestDto = Static<
  typeof FindParticipantSourceRequestDto
>;
