import { Record, Static, String } from 'runtypes';

/**
 * DTO that accepts any of the identifiers
 */
export const UpsertCourseRequestDto = Record({
  idSourceValue: String,
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpsertCourseRequestDto = Static<typeof UpsertCourseRequestDto>;
