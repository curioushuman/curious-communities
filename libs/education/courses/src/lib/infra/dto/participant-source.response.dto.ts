import { Record, Static, String } from 'runtypes';
/**
 * This is the structure of data the rest of our applications will receive.
 */
export const ParticipantSourceResponseDto = Record({
  id: String,
  courseId: String,
  status: String,
  name: String,
  email: String,
  organisationName: String,
});

/**
 * This is the structure of data the rest of our applications will receive.
 */
export type ParticipantSourceResponseDto = Static<
  typeof ParticipantSourceResponseDto
>;
