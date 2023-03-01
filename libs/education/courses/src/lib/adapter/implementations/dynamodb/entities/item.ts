import { DynamoDbItem } from '@curioushuman/common';

import { DynamoDbCourseAttributes, DynamoDbCourseSpecificKeys } from './course';
import { DynamoDbMemberAttributes } from './member';
import {
  DynamoDbParticipantAttributes,
  DynamoDbParticipantSpecificKeys,
} from './participant';

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have participant, and course information.
 * Throw allllll the attributes and keys in.
 *
 * TODO: there is probably a more elegant way of doing this.
 */

export type CoursesItemKeys = Partial<DynamoDbParticipantSpecificKeys> &
  Partial<DynamoDbCourseSpecificKeys>;

export type CoursesItemAttributes = Partial<DynamoDbParticipantAttributes> &
  Partial<DynamoDbCourseAttributes> &
  Partial<DynamoDbMemberAttributes>;

export type CoursesItem = CoursesItemKeys & CoursesItemAttributes;

export type CoursesDynamoDbItem = DynamoDbItem<CoursesItem>;
