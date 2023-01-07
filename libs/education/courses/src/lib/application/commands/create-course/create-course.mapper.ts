import { CreateCourseDto } from './create-course.dto';
import { CreateCourseRequestDto } from '../../../infra/create-course/dto/create-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { FindCourseDto } from '../../queries/find-course/find-course.dto';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { Source } from '../../../domain/value-objects/source';
import {
  createYearMonth,
  prepareExternalIdSource,
  prepareExternalIdSourceValue,
} from '@curioushuman/common';
import { CourseSource } from '../../../domain/entities/course-source';
import { Course } from '../../../domain/entities/course';
import { createCourseId } from '../../../domain/value-objects/course-id';
import { createCourseSlug } from '../../../domain/value-objects/course-slug';
import config from '../../../static/config';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCourseMapper {
  public static fromRequestDto(dto: CreateCourseRequestDto): CreateCourseDto {
    const parsedDto = prepareExternalIdSource(
      dto.idSourceValue,
      CourseSourceId,
      Source
    );
    return CreateCourseDto.check(parsedDto);
  }

  public static toFindCourseSourceDto(
    dto: CreateCourseDto
  ): FindCourseSourceDto {
    return FindCourseSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindCourseDto(dto: CreateCourseDto): FindCourseDto {
    return {
      identifier: 'idSourceValue',
      value: prepareExternalIdSourceValue(dto.id, dto.source),
    } as FindCourseDto;
  }

  public static fromSourceToCourse(source: CourseSource): Course {
    return Course.check({
      id: createCourseId(),
      slug: createCourseSlug(source),
      status: source.status,

      sourceIds: [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ],

      supportType: config.defaults.courseSupportType,
      name: source.name,
      dateOpen: source.dateOpen,
      dateClosed: source.dateClosed,
      yearMonthOpen: createYearMonth(source.dateOpen),

      accountOwner: config.defaults.accountOwner,
    });
  }
}
