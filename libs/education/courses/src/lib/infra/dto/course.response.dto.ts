/**
 * This is the structure of data the world will receive
 *
 * TODO
 * - Add swagger ApiProperty to all
 * - later, if/when necessary, add underlying interface
 */
export class CourseResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  details?: {
    specificCriteria?: string;
  };
  dateTrackMinimum!: number;
  dateOpen!: number;
  dateClosed!: number;
  yearMonthOpen!: string;
  countEntries!: number;
  countEntriesUnmoderated!: number;
  countEntriesModerated!: number;
  countResultsLongList!: number;
  countResultsShortList!: number;
  countResultsFinalists!: number;
  countResultsWinners!: number;
}
