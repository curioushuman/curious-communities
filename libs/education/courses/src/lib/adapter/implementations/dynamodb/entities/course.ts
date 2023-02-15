import { Null, Number, Optional, Record, Static, String } from 'runtypes';

import { DynamoDbItemKeys } from '@curioushuman/common';

/**
 * Keys for the course
 */
export const DynamoDbCourseKeys = DynamoDbItemKeys.extend({
  // these are sortKeys for the other DDB indexes
  // the pattern is SK_{Index_Name}

  // course
  Sk_Course_Slug: String,
  Sk_Course_SourceIdCOURSE: String,

  // participant
  // NOTE: we are not adding a value for this field/column
  // this means this row will not appear in that GSI
  // the course info is already duplicated in the participant rows
  // so it is unnecessary

  // member
  // we will include the member one so we can see courses as a sub list of member
  Sk_Member_Id: String,
});
/**
 * Keys for the course
 */
export type DynamoDbCourseKeys = Static<typeof DynamoDbCourseKeys>;

/**
 * Attributes for the course
 */
export const DynamoDbCourseAttributes = Record({
  Course_Id: String,
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
