import { createYearMonth } from '@curioushuman/common';

import { CreateCompetitionDto } from './create-competition.dto';
import { CreateCompetitionRequestDto } from '../../../infra/dto/create-competition.request.dto';
import { FindCompetitionSourceDto } from '../../queries/find-competition-source/find-competition-source.dto';
import { CompetitionSource } from '../../../domain/entities/competition-source';
import {
  Competition,
  createCompetitionSlug,
} from '../../../domain/entities/competition';
import { FindCompetitionDto } from '../../queries/find-competition/find-competition.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCompetitionMapper {
  public static fromRequestDto(
    dto: CreateCompetitionRequestDto
  ): CreateCompetitionDto {
    return CreateCompetitionDto.check({
      id: dto.id,
    });
  }

  public static toFindCompetitionSourceDto(
    dto: CreateCompetitionDto
  ): FindCompetitionSourceDto {
    return FindCompetitionSourceDto.check({
      id: dto.id,
    });
  }

  /**
   * TODO
   * - [ ] move this to a better home
   */
  public static fromSourceToCompetition(
    source: CompetitionSource
  ): Competition {
    return Competition.check({
      id: source.id,
      slug: createCompetitionSlug(source),
      name: source.name,
      details: {
        specificCriteria: source.specificCriteria,
      },
      dateTrackMinimum: source.dateTrackMinimum,
      dateOpen: source.dateOpen,
      dateClosed: source.dateClosed,
      yearMonthOpen: createYearMonth(source.dateOpen),
      countEntries: 0,
      countEntriesUnmoderated: 0,
      countEntriesModerated: 0,
      countResultsLongList: 0,
      countResultsShortList: 0,
      countResultsFinalists: 0,
      countResultsWinners: 0,
    });
  }

  public static fromSourceToFindCompetitionDto(
    source: CompetitionSource
  ): FindCompetitionDto {
    return {
      identifier: 'id',
      value: source.id,
    } as FindCompetitionDto;
  }
}
