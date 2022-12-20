/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class CourseSourceResponseDto {
  id!: string;
  name!: string;
  status!: string;
  specificCriteria?: string;
  dateTrackMinimum!: number;
  dateOpen!: number;
  dateClosed!: number;
}
