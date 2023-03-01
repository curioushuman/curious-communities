import { DynamoDbItemKeys } from '@curioushuman/common';
import { Null, Optional, Record, Static, String } from 'runtypes';

/**
 * Specific Keys for the participant
 *
 * UPDATE: removing the generic sort keys (sk2, etc) for now, we'll reconsider them
 * when we come to including some GSIs.
 *
 * NOTE: when you do include them, extend() DynamoDbItemKeys rather than brand it.
 */
export const DynamoDbParticipantSpecificKeys = Record({
  // these are sortKeys for the other DDB indexes
  // the pattern is SK_{Index_Name}

  // course
  Sk_Course_Slug: String,
  Sk_Course_SourceIdCOURSE: String,

  // participant
  Sk_Participant_SourceIdCOURSE: String,

  // member
  Sk_Member_Id: String,
});
/**
 * Specific Keys for the participant
 */
export type DynamoDbParticipantSpecificKeys = Static<
  typeof DynamoDbParticipantSpecificKeys
>;

/**
 * ALL Keys for the course
 */
export const DynamoDbParticipantKeys =
  DynamoDbParticipantSpecificKeys.And(DynamoDbItemKeys);
/**
 * ALL Keys for the course
 */
export type DynamoDbParticipantKeys = Static<typeof DynamoDbParticipantKeys>;

/**
 * Attributes for the participant
 */
export const DynamoDbParticipantAttributes = Record({
  // best to store the id here as an attr. as well
  Participant_Id: String,
  // we don't need Course_Id as that is already part of DdbCourseAttributes
  // we do need the value for each of our sourceIds
  Participant_SourceIdCOURSE: Optional(String.Or(Null)),
  // we don't need Member_Id as that will be included with DdbMemberAttributes

  Participant_Status: String,

  AccountOwner: String,
});
/**
 * Attributes for the participant
 */
export type DynamoDbParticipantAttributes = Static<
  typeof DynamoDbParticipantAttributes
>;

/**
 * Complete DynamoDb record
 *
 * NOTE: beware using the And method does not result in a Runtype
 * that has the same methods as a Record or Record.extend().
 *
 * Use it more for the type checking, rather than validation.
 */
export const DynamoDbParticipant = DynamoDbParticipantKeys.And(
  DynamoDbParticipantAttributes
);
/**
 * Complete DynamoDb record
 */
export type DynamoDbParticipant = Static<typeof DynamoDbParticipant>;
