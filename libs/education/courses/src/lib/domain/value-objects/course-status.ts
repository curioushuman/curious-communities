import { Static } from 'runtypes';
import { CourseSourceStatus } from './course-source-status';

/**
 * ? Should we define the list twice?
 */
export const CourseStatus = CourseSourceStatus.withBrand('CourseStatus');

export type CourseStatus = Static<typeof CourseStatus>;
