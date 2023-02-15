import { Static } from 'runtypes';

import { DynamoDbMemberCommonAttributes } from '@curioushuman/common';

/**
 * Keys for the member
 *
 * NOTE: We don't need keys for the member.
 * As far as DDB is concerned they are just additional attributes of a groupMember
 * We don't need them as a top level object in this context
 */

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
