import { Optional, Record, Static } from 'runtypes';

import { CourseSourceCriteria } from './course-source-criteria';

export const CourseDetails = Record({
  specificCriteria: Optional(CourseSourceCriteria),
});

export type CourseDetails = Static<typeof CourseDetails>;
