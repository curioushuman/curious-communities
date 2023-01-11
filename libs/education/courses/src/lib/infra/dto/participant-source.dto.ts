import { Record, Static, String } from 'runtypes';

/**
 * Type for external participant source entity
 * i.e. passed in from external application
 *
 * NOTES
 * - this is a DTO to distinguish it from an actual Participant entity
 *   i.e. it is an incomplete DTO that only includes the values we need
 * - we only include the value objects we need within the groups context
 */
export const ParticipantSourceDto = Record({
  id: String,
  status: String,
});

/**
 * Type for internal group entity
 */
export type ParticipantSourceDto = Static<typeof ParticipantSourceDto>;
