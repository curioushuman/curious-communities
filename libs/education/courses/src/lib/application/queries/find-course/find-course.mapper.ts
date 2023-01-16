import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindCourseDto } from './find-course.dto';
import {
  FindByIdSourceValueCourseRequestDto,
  FindByIdCourseRequestDto,
  FindCourseRequestDto,
} from '../../../infra/find-course/dto/find-course.request.dto';
import { CourseId } from '../../../domain/value-objects/course-id';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';
import { Source } from '../../../domain/value-objects/source';
import { CreateCourseRequestDto } from '../../../infra/create-course/dto/create-course.request.dto';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindCourseMapper {
  public static fromFindRequestDto(dto: FindCourseRequestDto): FindCourseDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    return dto.id
      ? FindCourseMapper.fromFindByIdRequestDto({
          id: dto.id,
        })
      : FindCourseMapper.fromFindByIdSourceValueRequestDto({
          idSourceValue: dto.idSourceValue as string,
        });
  }

  public static fromFindByIdRequestDto(
    dto: FindByIdCourseRequestDto
  ): FindCourseDto {
    // this will throw an error if the id is not valid
    const value = CourseId.check(dto.id);
    return {
      identifier: 'id',
      value,
    } as FindCourseDto;
  }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueCourseRequestDto
  ): FindCourseDto {
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      CourseSourceId,
      Source
    );
    return {
      identifier: 'idSourceValue',
      value,
    } as FindCourseDto;
  }

  public static fromCreateCourseRequestDto(
    dto: CreateCourseRequestDto
  ): FindCourseDto {
    return {
      identifier: 'idSourceValue',
      value: dto.idSourceValue,
    } as FindCourseDto;
  }
}
