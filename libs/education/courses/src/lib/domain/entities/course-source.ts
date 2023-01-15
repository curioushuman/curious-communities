import { Optional, Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { CourseSourceId } from '../value-objects/course-source-id';
import { CourseSourceName } from '../value-objects/course-source-name';
import { CourseSourceStatus } from '../value-objects/course-source-status';

export const CourseSource = Record({
  id: CourseSourceId,
  status: CourseSourceStatus,
  name: CourseSourceName,
  dateOpen: Optional(Timestamp),
  dateClosed: Optional(Timestamp),
});

export type CourseSource = Static<typeof CourseSource>;
