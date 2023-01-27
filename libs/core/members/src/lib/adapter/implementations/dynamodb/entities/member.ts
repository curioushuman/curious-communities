import { DynamoDbItemKeys } from '@curioushuman/common';
import { Null, Optional, Record, Static, String } from 'runtypes';

/**
 * Keys for the participant
 *
 * UPDATE: removing the generic sort keys (sk2, etc) for now, we'll reconsider them
 * when we come to including some GSIs.
 *
 * NOTE: when you do include them, extend() DynamoDbItemKeys rather than brand it.
 */
export const DynamoDbMemberKeys = DynamoDbItemKeys.extend({
  Sk_Member_Email: String,
  Sk_Member_SourceIdCOURSE: String,
});
/**
 * Keys for the participant
 */
export type DynamoDbMemberKeys = Static<typeof DynamoDbMemberKeys>;

/**
 * Attributes for the participant
 */
export const DynamoDbMemberAttributes = Record({
  Member_SourceIdCOURSE: Optional(String.Or(Null)),

  Member_Status: String,
  Member_Name: String,
  Member_Email: String,
  Member_OrganisationName: String,

  AccountOwner: String,
});
/**
 * Attributes for the participant
 */
export type DynamoDbMemberAttributes = Static<typeof DynamoDbMemberAttributes>;

/**
 * Complete DynamoDb record
 *
 * NOTE: beware using the And method does not result in a Runtype
 * that has the same methods as a Record or Record.extend().
 *
 * Use it more for the type checking, rather than validation.
 */
export const DynamoDbMember = DynamoDbMemberKeys.And(DynamoDbMemberAttributes);
/**
 * Complete DynamoDb record
 */
export type DynamoDbMember = Static<typeof DynamoDbMember>;
