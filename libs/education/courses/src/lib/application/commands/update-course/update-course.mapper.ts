import { UpdateCourseDto } from './update-course.dto';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { FindCourseDto } from '../../queries/find-course/find-course.dto';
import {
  prepareExternalIdSource,
  prepareExternalIdSourceValue,
} from '@curioushuman/common';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateCourseMapper {
  public static fromRequestDto(dto: UpdateCourseRequestDto): UpdateCourseDto {
    const parsedDto = prepareExternalIdSource(
      dto.idSource,
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
      identifier: 'idSource',
      value: prepareExternalIdSourceValue(dto.id, dto.source),
    } as FindCourseDto;
  }
}
