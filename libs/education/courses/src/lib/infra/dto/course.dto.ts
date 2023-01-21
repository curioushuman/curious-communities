import { Record, Static, String } from 'runtypes';

/**
 * Type for external course entity
 *
 * NOTES
 * - this is a DTO to distinguish it from an actual Course entity
 *   i.e. it is an incomplete DTO that only includes the values we need
 * - we only include the value objects we need within the groups context
 */
export const CourseDto = Record({
  id: String,
  slug: String,
  status: String,
  sourceIds: Array(String),
  supportType: String,
  name: String,
  dateOpen: Optional(Number),
  dateClosed: Optional(Number),
  yearMonthOpen: Optional(String),
  accountOwner: String,
});

/**
 * Type for internal group entity
 */
export type CourseDto = Static<typeof CourseDto>;
