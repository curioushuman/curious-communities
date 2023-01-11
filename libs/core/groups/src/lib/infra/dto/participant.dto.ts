import { Record, Static, String } from 'runtypes';

/**
 * Type for external participant entity
 *
 * NOTES
 * - this is a DTO to distinguish it from an actual Participant entity
 *   i.e. it is an incomplete DTO that only includes the values we need
 * - we only include the value objects we need within the groups context
 */
export const ParticipantDto = Record({
  id: String,
  courseId: String,
  memberId: String,
  status: String,
  name: String,
  email: String,
  organisationName: String,

  // e.g. APF being the account that owns this group
  accountOwner: String,
});

/**
 * Type for internal group entity
 */
export type ParticipantDto = Static<typeof ParticipantDto>;
