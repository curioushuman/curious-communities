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
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';
import { UpsertCourseRequestDto } from '../../../infra/upsert-course/dto/upsert-course.request.dto';
import { CourseSourceIdSourceValue } from '../../../domain/value-objects/course-source-id-source';

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

  public static fromId(value: string): FindCourseDto {
    return {
      identifier: 'id',
      value,
    } as FindCourseDto;
  }

  public static fromIdSourceValue(value: string): FindCourseDto {
    return {
      identifier: 'idSourceValue',
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
    return FindCourseMapper.fromIdSourceValue(value);
  }

  public static fromCreateCourseRequestDto(
    dto: CreateCourseRequestDto
  ): FindCourseDto {
    return FindCourseMapper.fromIdSourceValue(dto.idSourceValue);
  }

  public static fromUpsertCourseRequestDto(
    dto: UpsertCourseRequestDto
  ): FindCourseDto {
    return FindCourseMapper.fromIdSourceValue(dto.idSourceValue);
  }

  public static fromUpdateCourseRequestDto(
    dto: UpdateCourseRequestDto
  ): FindCourseDto {
    if (dto.course) {
      return FindCourseMapper.fromId(dto.course.id);
    }
    // typecasting as DTO includes constraint for one of either
    return FindCourseMapper.fromIdSourceValue(
      dto.idSourceValue as CourseSourceIdSourceValue
    );
  }
}
