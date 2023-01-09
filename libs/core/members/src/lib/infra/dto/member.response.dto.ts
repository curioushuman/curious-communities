import { Array, Record, Static, String } from 'runtypes';

/**
 * This is the structure of data the world will receive
 *
 * UPDATE
 *
 * This is the structure of data the rest of our applications will receive.
 * When it comes to stripping out data for the public, we'll do that in the
 * API (i.e. API Gateway) layer, not here.
 *
 * I think it is still worth including a layer of abstraction between the
 * core Member entity and the DTO we hand around to other applications.
 *
 * TODO
 * - [*] Unnecessary - Somehow strip out some elements for admin only
 * - [*] Unnecessary - Add swagger ApiProperty to all
 * - [ ] later, if/when necessary, add underlying interface
 *
 * ? QUESTIONS
 * ? [*] Should we expose the externalIdentifiers?
 *       Yes, we'll expose this as admin only. Moved to TODO
 */
export const MemberResponseDto = Record({
  id: String,
  status: String,
  sourceIds: Array(String),
  name: String,
  email: String,
  organisationName: String,
  accountOwner: String,
});

/**
 * DTO that accepts any of the identifiers
 */
export type MemberResponseDto = Static<typeof MemberResponseDto>;
