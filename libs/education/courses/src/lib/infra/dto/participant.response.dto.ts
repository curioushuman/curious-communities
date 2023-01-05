/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - [ ] Somehow strip out some elements for admin only
 * - [ ] Add swagger ApiProperty to all
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

  memberName!: string;
  memberEmail!: string;
  memberOrganisationName!: string;
}
