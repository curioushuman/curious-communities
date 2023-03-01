import { DynamoDbItemKeys } from '@curioushuman/common';
import { Null, Optional, Record, Static, String } from 'runtypes';

/**
 * Keys for the groupMember
 */
export const DynamoDbGroupMemberSpecificKeys = Record({
  // these are sortKeys for the other DDB indexes
  // the pattern is SK_{Index_Name}

  // Group
  // Standard
  Sk_Group_Slug: String,
  // these are optional as at times there will yet to be values
  Sk_Group_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Sk_Group_SourceIdMICRO-COURSE': Optional(String.Or(Null)),
  // Course
  Sk_Group_CourseId: Optional(String.Or(Null)),

  // GroupMember
  // Standard
  // NOTE: no sourceIds
  // memberId, which is handled below
  // Course
  Sk_GroupMember_ParticipantId: Optional(String.Or(Null)),

  // member
  Sk_Member_Id: String,
});
/**
 * Keys for the groupMember
 */
export type DynamoDbGroupMemberSpecificKeys = Static<
  typeof DynamoDbGroupMemberSpecificKeys
>;

/**
 * ALL Keys for the group
 */
export const DynamoDbGroupMemberKeys =
  DynamoDbGroupMemberSpecificKeys.And(DynamoDbItemKeys);
/**
 * All Keys for the group
 */
export type DynamoDbGroupMemberKeys = Static<typeof DynamoDbGroupMemberKeys>;

/**
 * Attributes for the groupMember
 */
export const DynamoDbGroupMemberAttributes = Record({
  GroupMember_Type: String,
  GroupMember_Id: String,

  // NOTE: we don't need group or member id as they will be included
  // in their respective attributes
  // as part of the GroupsDdbItem

  // NOTE: we also don't need to define Group_CourseId here
  // it is part of the GroupsDdbItem
  GroupMember_ParticipantId: Optional(String.Or(Null)),

  GroupMember_Status: String,
  AccountOwner: String,
});
/**
 * Attributes for the groupMember
 */
export type DynamoDbGroupMemberAttributes = Static<
  typeof DynamoDbGroupMemberAttributes
>;

/**
 * Complete DynamoDb record
 *
 * NOTE: beware using the And method does not result in a Runtype
 * that has the same methods as a Record or Record.extend().
 *
 * Use it more for the type checking, rather than validation.
 */
export const DynamoDbGroupMember = DynamoDbGroupMemberKeys.And(
  DynamoDbGroupMemberAttributes
);
/**
 * Complete DynamoDb record
 */
export type DynamoDbGroupMember = Static<typeof DynamoDbGroupMember>;
