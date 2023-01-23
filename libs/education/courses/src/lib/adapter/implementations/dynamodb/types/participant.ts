import { Null, Optional, Record, Static, String } from 'runtypes';
import { DynamoDbItemKeys } from './item';

/**
 * Keys for the participant
 *
 * UPDATE: removing the generic sort keys (sk2, etc) for now, we'll reconsider them
 * when we come to including some GSIs.
 *
 * NOTE: when you do include them, extend() DynamoDbItemKeys rather than brand it.
 */
export const DynamoDbParticipantKeys = DynamoDbItemKeys.withBrand(
  'DynamoDbParticipantKeys'
);
/**
 * Keys for the participant
 */
export type DynamoDbParticipantKeys = Static<typeof DynamoDbParticipantKeys>;

/**
 * Attributes for the participant
 */
export const DynamoDbParticipantAttributes = Record({
  Participant_SourceIdCOURSE: Optional(String.Or(Null)),
  Participant_CourseId: String,
  Participant_MemberId: String,

  Participant_Status: String,
  Participant_Name: String,
  Participant_Email: String,
  Participant_OrganisationName: String,

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
