import { Null, Optional, Record, Static, String } from 'runtypes';
import { DynamoDbItemKeys } from './item';

/**
 * A global constant of where our members are synced to
 */
export const memberSources = ['CRM', 'AUTH', 'COMMUNITY', 'MICRO-COURSE'];

/**
 * Common Keys for the member
 */
export const DynamoDbMemberCommonKeys = DynamoDbItemKeys.extend({
  Sk_Member_Email: String,
  // these are optional as at times there will yet to be values
  Sk_Member_SourceIdCRM: Optional(String.Or(Null)),
  Sk_Member_SourceIdAUTH: Optional(String.Or(Null)),
  Sk_Member_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Sk_Member_SourceIdMICRO-COURSE': Optional(String.Or(Null)),
});
/**
 * Common Keys for the member
 */
export type DynamoDbMemberCommonKeys = Static<typeof DynamoDbMemberCommonKeys>;

/**
 * Common Attributes for the member
 */
export const DynamoDbMemberCommonAttributes = Record({
  // even though pk and sk are the member id
  // it's best and simplest to keep it separate
  // as PKs and SKs can change depending on whether you're querying
  // a table, or an index etc
  Member_Id: String,
  // primary source
  Member_SourceIdCRM: Optional(String.Or(Null)),
  // other sources
  Member_SourceIdAUTH: Optional(String.Or(Null)),
  Member_SourceIdCOMMUNITY: Optional(String.Or(Null)),
  'Member_SourceIdMICRO-COURSE': Optional(String.Or(Null)),

  Member_Status: String,
  Member_Name: String,
  Member_Email: String,
  Member_OrganisationName: String,

  AccountOwner: String,
});
/**
 * Common Attributes for the member
 */
export type DynamoDbMemberCommonAttributes = Static<
  typeof DynamoDbMemberCommonAttributes
>;
