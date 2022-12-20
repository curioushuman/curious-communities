import { CompetitionResponseDto } from './dto/competition.response.dto';
import { Competition } from '../domain/entities/competition';

/**
 * TODO
 * - Should we do more checking of CompetitionResponseDto?
 */
export class CompetitionsMapper {
  public static toResponseDto(
    competition: Competition
  ): CompetitionResponseDto {
    return {
      id: competition.id,
      name: competition.name,
      slug: competition.slug,
      details: competition.details,
      dateTrackMinimum: competition.dateTrackMinimum,
      dateOpen: competition.dateOpen,
      dateClosed: competition.dateClosed,
      yearMonthOpen: competition.yearMonthOpen,
      countEntries: competition.countEntries,
      countEntriesUnmoderated: competition.countEntriesUnmoderated,
      countEntriesModerated: competition.countEntriesModerated,
      countResultsLongList: competition.countResultsLongList,
      countResultsShortList: competition.countResultsShortList,
      countResultsFinalists: competition.countResultsFinalists,
      countResultsWinners: competition.countResultsWinners,
    } as CompetitionResponseDto;
  }
}
