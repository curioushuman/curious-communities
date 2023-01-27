import { DynamoDbItem } from '@curioushuman/common';

import { DynamoDbCourseAttributes } from './course';
import { DynamoDbParticipantAttributes } from './participant';

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have participant, and course information.
 * Throw allllll the attributes in.
 * Omitting any that may double up.
 *
 * TODO: there is probably a more elegant way of doing this.
 */
export type CoursesItem = Partial<DynamoDbParticipantAttributes> &
  Omit<Partial<DynamoDbCourseAttributes>, 'AccountOwner'>;

export type CoursesDynamoDbItem = DynamoDbItem<CoursesItem>;
