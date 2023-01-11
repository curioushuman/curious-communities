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
 * core Participant entity and the DTO we hand around to other applications.
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
export class ParticipantResponseDto {
  id!: string;
  memberId!: string;
  courseId!: string;
  status!: string;

  sourceIds!: string[];

  name!: string;
  email!: string;
  organisationName!: string;
}
