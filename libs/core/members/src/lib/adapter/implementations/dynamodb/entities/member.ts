import { Static } from 'runtypes';

import {
  DynamoDbMemberCommonAttributes,
  DynamoDbMemberCommonKeys,
} from '@curioushuman/common';

/**
 * Keys for the member
 */
export const DynamoDbMemberKeys = DynamoDbMemberCommonKeys.pick(
  'primaryKey',
  'sortKey',
  'Sk_Member_Email',
  'Sk_Member_SourceIdCRM',
  'Sk_Member_SourceIdAUTH',
  'Sk_Member_SourceIdCOMMUNITY',
  'Sk_Member_SourceIdMICRO-COURSE'
);
/**
 * Keys for the member
 */
export type DynamoDbMemberKeys = Static<typeof DynamoDbMemberKeys>;

/**
 * Attributes for the member
 */
export const DynamoDbMemberAttributes = DynamoDbMemberCommonAttributes.pick(
  'Member_Id',
  'Member_SourceIdCRM',
  'Member_SourceIdAUTH',
  'Member_SourceIdCOMMUNITY',
  'Member_SourceIdMICRO-COURSE',
  'Member_Status',
  'Member_Name',
  'Member_Email',
  'Member_OrganisationName',
  'AccountOwner'
);
/**
 * Attributes for the member
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
