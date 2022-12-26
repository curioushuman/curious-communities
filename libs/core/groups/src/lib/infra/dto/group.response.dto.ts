/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class GroupResponseDto {
  id!: string;
  slug!: string;
  status!: string;
  supportType!: string;
  name!: string;
  dateOpen!: number;
  dateClosed!: number;
  yearMonthOpen!: string;
}
