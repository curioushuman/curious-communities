import { Record, Static } from 'runtypes';
import { CourseFilters } from '../../../domain/entities/course';

/**
 * Input for query to find participants
 *
 * TODO:
 * - [ ] accept filters and such
 */
export const FindCoursesDto = Record({
  filters: CourseFilters,
});

export type FindCoursesDto = Static<typeof FindCoursesDto>;
