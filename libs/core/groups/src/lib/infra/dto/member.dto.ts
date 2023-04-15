import { Array, Null, Optional, Record, Static, String } from 'runtypes';

/**
 * Type for external member entity
 *
 * NOTES
 * - this is a DTO to distinguish it from an actual member entity
 *   i.e. it is an incomplete DTO that only includes the values we need
 * - we only include the value objects we need within the groups context
 */
export const MemberDto = Record({
  id: String,
  sourceOrigin: Optional(String),
  sourceIds: Array(String),

  status: String,
  name: String,
  email: String,
  organisationName: String.Or(Null),

  accountOwner: String,
});

/**
 * Type for the (internal) participant entity
 */
export type MemberDto = Static<typeof MemberDto>;
