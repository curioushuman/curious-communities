import { Null, Optional, Record, Static, String } from 'runtypes';

import { DynamoDbItemKeys } from '@curioushuman/common';

/**
 * Keys for the group
 */
export const DynamoDbGroupKeys = DynamoDbItemKeys.extend({
  // these are sortKeys for the other DDB indexes
  // the pattern is SK_{Index_Name}

  // group
  // Standard
  Sk_Group_Slug: String,
  Sk_Group_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Sk_Group_SourceIdMICRO-COURSE': Optional(String.Or(Null)),
  // Course
  Sk_Group_CourseId: Optional(String.Or(Null)),

  // group member
  // none; we don't need the group rows in the groupMember index

  // member
  // we will include the member one so we can see groups as a sub list of member
  Sk_Member_Id: String,
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
  Group_Id: String,
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
