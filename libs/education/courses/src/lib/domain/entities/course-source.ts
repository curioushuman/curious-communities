import { Optional, Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { CourseName } from '../value-objects/course-name';
import { CourseSourceCriteria } from '../value-objects/course-source-criteria';
import { CourseSourceStatus } from '../value-objects/course-source-status';
import { CourseId } from '../value-objects/course-id';

export const CourseSource = Record({
  id: CourseId,
  name: CourseName,
  status: CourseSourceStatus,
  specificCriteria: Optional(CourseSourceCriteria),
  dateTrackMinimum: Timestamp,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
});

export type CourseSource = Static<typeof CourseSource>;

// courseId must in fact be empty when we are creating a course (from source)
const sourceForCreate = Record({
  status: CourseSourceStatus.withConstraint(
    (status) =>
      status === 'ready' ||
      `Source course not in a ready state, therefore could not be created.`
  ),
});
export const CourseSourceForCreate = sourceForCreate.And(CourseSource);

export type CourseSourceForCreate = Static<typeof CourseSourceForCreate>;
