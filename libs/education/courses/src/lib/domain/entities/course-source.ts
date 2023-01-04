import { Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { CourseSourceStatus } from '../value-objects/course-source-status';
import { CourseSourceId } from '../value-objects/course-source-id';
import { CourseSourceName } from '../value-objects/course-source-name';

export const CourseSource = Record({
  id: CourseSourceId,
  status: CourseSourceStatus,
  name: CourseSourceName,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
});

export type CourseSource = Static<typeof CourseSource>;
