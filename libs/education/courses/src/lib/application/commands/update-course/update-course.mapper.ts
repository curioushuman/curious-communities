import { UpdateCourseDto } from './update-course.dto';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { FindCourseDto } from '../../queries/find-course/find-course.dto';
import {
  createYearMonth,
  prepareExternalIdSource,
  prepareExternalIdSourceValue,
} from '@curioushuman/common';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { Source } from '../../../domain/value-objects/source';
import { CourseSource } from '../../../domain/entities/course-source';
import { Course } from '../../../domain/entities/course';
import { createCourseSlug } from '../../../domain/value-objects/course-slug';
import config from '../../../static/config';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateCourseMapper {
  public static fromRequestDto(dto: UpdateCourseRequestDto): UpdateCourseDto {
    const parsedDto = prepareExternalIdSource(
      dto.idSourceValue,
      CourseSourceId,
      Source
    );
    return UpdateCourseDto.check(parsedDto);
  }

  public static toFindCourseSourceDto(
    dto: UpdateCourseDto
  ): FindCourseSourceDto {
    return FindCourseSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindCourseDto(dto: UpdateCourseDto): FindCourseDto {
    return {
      identifier: 'idSourceValue',
      value: prepareExternalIdSourceValue(dto.id, dto.source),
    } as FindCourseDto;
  }

  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing course, and the source that will be overriding it
   */
  public static fromSourceToCourse(
    course: Course
  ): (source: CourseSource) => Course {
    return (source: CourseSource) => {
      return Course.check({
        id: course.id,
        slug: createCourseSlug(source),
        status: source.status,

        sourceIds: [
          {
            id: source.id,
            source: 'COURSE',
          },
        ],

        supportType: config.defaults.courseSupportType,
        name: source.name,
        dateOpen: source.dateOpen,
        dateClosed: source.dateClosed,
        yearMonthOpen: createYearMonth(source.dateOpen),

        accountOwner: config.defaults.accountOwner,
      });
    };
  }
}
