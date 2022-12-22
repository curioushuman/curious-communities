/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class ParticipantResponseDto {
  id!: string;
  memberId!: string;
  courseId!: string;
  status!: string;
  memberName!: string;
  memberEmail!: string;
  memberOrganisationName!: string;
}
