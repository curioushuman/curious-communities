import { DynamoDbItemKeys } from '@curioushuman/common';
import { Null, Optional, Record, Static, String } from 'runtypes';

/**
 * Keys for the groupMember
 */
export const DynamoDbGroupMemberKeys = DynamoDbItemKeys.extend({
  // Group
  // Standard
  Sk_Group_Slug: String,
  Sk_Group_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Sk_Group_SourceIdMICRO-COURSE': Optional(String.Or(Null)),
  // Course
  Sk_Group_CourseId: Optional(String.Or(Null)),

  // GroupMember
  // Standard
  Sk_GroupMember_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Sk_GroupMember_SourceIdMICRO-COURSE': Optional(String.Or(Null)),
  // Course
  Sk_GroupMember_ParticipantId: Optional(String.Or(Null)),
});
/**
 * Keys for the groupMember
 */
export type DynamoDbGroupMemberKeys = Static<typeof DynamoDbGroupMemberKeys>;

/**
 * Attributes for the groupMember
 */
export const DynamoDbGroupMemberAttributes = Record({
  GroupMember_Type: String,

  GroupMember_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'GroupMember_SourceIdMICRO-COURSE': Optional(String.Or(Null)),

  GroupMember_GroupId: String,
  GroupMember_MemberId: String,

  // NOTE: we don't need to define Group_CourseId here
  // it is part of the CoursesItem and will be available
  // during mapping process
  // Group_CourseId: Optional(String.Or(Null)),
  GroupMember_ParticipantId: Optional(String.Or(Null)),

  GroupMember_Status: String,
  GroupMember_Name: String,
  GroupMember_Email: String,
  GroupMember_OrganisationName: String,

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
