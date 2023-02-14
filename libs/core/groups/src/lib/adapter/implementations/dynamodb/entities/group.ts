import { Null, Optional, Record, Static, String } from 'runtypes';

import { DynamoDbItemKeys } from '@curioushuman/common';

/**
 * Keys for the group
 */
export const DynamoDbGroupKeys = DynamoDbItemKeys.extend({
  // Standard
  Sk_Group_Slug: String,
  Sk_Group_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Sk_Group_SourceIdMICRO-COURSE': Optional(String.Or(Null)),
  // Course
  Sk_Group_CourseId: Optional(String.Or(Null)),
  // NOTE: does not include Sk from GroupMember
  // this means these rows will not appear in that GSI
});
/**
 * Keys for the group
 */
export type DynamoDbGroupKeys = Static<typeof DynamoDbGroupKeys>;

/**
 * Attributes for the group
 */
export const DynamoDbGroupAttributes = Record({
  Group_Type: String,

  Group_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Group_SourceIdMICRO-COURSE': Optional(String.Or(Null)),

  Group_CourseId: Optional(String.Or(Null)),

  Group_Slug: String,
  Group_Status: String,
  Group_Name: String,

  AccountOwner: String,
});
/**
 * Attributes for the group
 */
export type DynamoDbGroupAttributes = Static<typeof DynamoDbGroupAttributes>;

/**
 * Complete DynamoDb record
 *
 * NOTE: beware using the And method does not result in a Runtype
 * that has the same methods as a Record or Record.extend().
 *
 * Use it more for the type checking, rather than validation.
 */
export const DynamoDbGroup = DynamoDbGroupKeys.And(DynamoDbGroupAttributes);
/**
 * Complete DynamoDb record
 */
export type DynamoDbGroup = Static<typeof DynamoDbGroup>;
