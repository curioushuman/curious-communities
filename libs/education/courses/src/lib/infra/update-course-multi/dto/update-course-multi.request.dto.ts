import { Number, Optional, Record, Static, String } from 'runtypes';

const dateOpenRange = Record({
  start: Number,
  end: Number,
});

/**
 * Externally facing DTO for update multiple participants at a time
 */
export const UpdateCourseMultiRequestDto = Record({
  dateOpenRange: Optional(dateOpenRange),
  status: Optional(String),
}).withConstraint((dto) => !!(dto.dateOpenRange || dto.status));

export type UpdateCourseMultiRequestDto = Static<
  typeof UpdateCourseMultiRequestDto
>;
