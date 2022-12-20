import { createYearMonth } from '@curioushuman/common';

import { CreateCourseDto } from './create-course.dto';
import { CreateCourseRequestDto } from '../../../infra/dto/create-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { CourseSource } from '../../../domain/entities/course-source';
import { Course, createCourseSlug } from '../../../domain/entities/course';
import { FindCourseDto } from '../../queries/find-course/find-course.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCourseMapper {
  public static fromRequestDto(dto: CreateCourseRequestDto): CreateCourseDto {
    return CreateCourseDto.check({
      id: dto.id,
    });
  }

  public static toFindCourseSourceDto(
    dto: CreateCourseDto
  ): FindCourseSourceDto {
    return FindCourseSourceDto.check({
      id: dto.id,
    });
  }

  /**
   * TODO
   * - [ ] move this to a better home
   */
  public static fromSourceToCourse(source: CourseSource): Course {
    return Course.check({
      id: source.id,
      slug: createCourseSlug(source),
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

  public static fromSourceToFindCourseDto(source: CourseSource): FindCourseDto {
    return {
      identifier: 'id',
      value: source.id,
    } as FindCourseDto;
  }
}
