import { Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindParticipantRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const FindParticipantSourceRequestDto = Record({
  idSourceValue: String,
});

export type FindParticipantSourceRequestDto = Static<
  typeof FindParticipantSourceRequestDto
>;

/**
 * Currently we only accept the DTO
 * But this keeps to our pattern
 */
export type FindParticipantSourceDtoOrEvent = FindParticipantSourceRequestDto;

/**
 * This will determine what kind of input we have received
 * and extract the data we need from it
 *
 * NOTE: validation of data is a separate step
 */
export function locateDto(
  incomingEvent: FindParticipantSourceDtoOrEvent
): FindParticipantSourceRequestDto {
  return incomingEvent;
}
