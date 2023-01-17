import { Optional, Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { CourseSourceId } from '../value-objects/course-source-id';
import { CourseSourceName } from '../value-objects/course-source-name';
import { CourseSourceStatus } from '../value-objects/course-source-status';
import { CourseSourceIdSource } from '../value-objects/course-source-id-source';

export const CourseSource = Record({
  id: CourseSourceId,
  status: CourseSourceStatus,
  name: CourseSourceName,
  dateOpen: Optional(Timestamp),
  dateClosed: Optional(Timestamp),
});

export type CourseSource = Static<typeof CourseSource>;

/**
 * Type that defines all the possible identifiers for a course
 * NOTE: this is utilized in find-course.dto.ts and course.repository.ts
 * to define parsers and finders.
 */
export type CourseSourceIdentifiers = {
  idSource: CourseSourceIdSource;
};
export type CourseSourceIdentifier = keyof CourseSourceIdentifiers;
// NOTE: the ValueOf utility type doesn't work when there is only a single identifier
// export type CourseSourceIdentifierValue = ValueOf<CourseSourceIdentifier>;
export type CourseSourceIdentifierValue = CourseSourceIdSource;
