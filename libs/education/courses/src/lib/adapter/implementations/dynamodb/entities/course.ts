import { Null, Number, Optional, Record, Static, String } from 'runtypes';

import { DynamoDbItemKeys } from '@curioushuman/common';

/**
 * Keys for the course
 */
export const DynamoDbCourseKeys = DynamoDbItemKeys.extend({
  Sk_Course_Slug: String,
  Sk_Course_SourceIdCOURSE: String,
  // NOTE: does not include Sk_Participant_SourceIdCOURSE
  // this means these rows will not appear in that GSI
});
/**
 * Keys for the course
 */
export type DynamoDbCourseKeys = Static<typeof DynamoDbCourseKeys>;

/**
 * Attributes for the course
 */
export const DynamoDbCourseAttributes = Record({
  Course_SourceIdCOURSE: Optional(String.Or(Null)),

  Course_Slug: String,
  Course_Status: String,
  Course_SupportType: String,
  Course_Name: String,
  Course_DateOpen: Optional(Number.Or(Null)),
  Course_DateClosed: Optional(Number.Or(Null)),

  AccountOwner: String,
});
/**
 * Attributes for the course
 */
export type DynamoDbCourseAttributes = Static<typeof DynamoDbCourseAttributes>;

/**
 * Complete DynamoDb record
 *
 * NOTE: beware using the And method does not result in a Runtype
 * that has the same methods as a Record or Record.extend().
 *
 * Use it more for the type checking, rather than validation.
 */
export const DynamoDbCourse = DynamoDbCourseKeys.And(DynamoDbCourseAttributes);
/**
 * Complete DynamoDb record
 */
export type DynamoDbCourse = Static<typeof DynamoDbCourse>;
