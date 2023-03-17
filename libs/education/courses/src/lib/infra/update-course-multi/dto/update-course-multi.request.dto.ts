import { Number, Record, Static } from 'runtypes';

/**
 * Externally facing DTO for update multiple participants at a time
 */
export const UpdateCourseMultiRequestDto = Record({
  dateOpenRange: Record({
    start: Number,
    end: Number,
  }),
});

export type UpdateCourseMultiRequestDto = Static<
  typeof UpdateCourseMultiRequestDto
>;
