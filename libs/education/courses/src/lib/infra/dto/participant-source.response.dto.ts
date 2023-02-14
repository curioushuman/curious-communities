import { Record, Static, String } from 'runtypes';
/**
 * This is the structure of data the rest of our applications will receive.
 */
export const ParticipantSourceResponseDto = Record({
  id: String,
  source: String,
  courseId: String,
  memberEmail: String,
  status: String,
});

/**
 * This is the structure of data the rest of our applications will receive.
 */
export type ParticipantSourceResponseDto = Static<
  typeof ParticipantSourceResponseDto
>;
