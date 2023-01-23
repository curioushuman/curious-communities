import { Null, Number, Optional, Record, Static, String } from 'runtypes';
import { DynamoDbItemKeys } from './item';

/**
 * Keys for the course
 *
 * UPDATE: removing the generic sort keys for now, we'll reconsider them
 * when we come to including some GSIs.
 *
 * NOTE: when you do include them, extend() DynamoDbItemKeys rather than brand it.
 */
export const DynamoDbCourseKeys =
  DynamoDbItemKeys.withBrand('DynamoDbCourseKeys');
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
