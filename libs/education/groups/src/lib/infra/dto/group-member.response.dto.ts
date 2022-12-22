/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class GroupMemberResponseDto {
  id!: string;
  memberId!: string;
  groupId!: string;
  status!: string;
  memberName!: string;
  memberEmail!: string;
  memberOrganisationName!: string;
}
