import { Static, String } from 'runtypes';

export const CourseSourceCriteria = String.withBrand('CourseCriteria');

export type CourseSourceCriteria = Static<typeof CourseSourceCriteria>;
