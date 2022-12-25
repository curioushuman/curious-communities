/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class MemberResponseDto {
  externalId!: string;
  slug!: string;
  status!: string;
  name!: string;
  email!: string;
  organisationName!: string;
}
