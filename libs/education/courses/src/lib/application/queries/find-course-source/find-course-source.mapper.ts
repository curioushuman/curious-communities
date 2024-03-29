import { FindCourseSourceDto } from './find-course-source.dto';
import { CreateCourseRequestDto } from '../../../infra/create-course/dto/create-course.request.dto';
import { prepareCourseExternalIdSource } from '../../../domain/entities/course';
import { Source } from '../../../domain/value-objects/source';
import { UpsertCourseRequestDto } from '../../../infra/upsert-course/dto/upsert-course.request.dto';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindCourseSourceMapper {
  public static fromIdSourceValue(
    idSourceValue: string,
    sourceOverride?: Source
  ): FindCourseSourceDto {
    const value = prepareCourseExternalIdSource(idSourceValue);
    const source = Source.check(sourceOverride || value.source);
    return {
      identifier: 'idSource',
      value,
      source,
    };
  }

  public static fromCreateCourseRequestDto(
    dto: CreateCourseRequestDto
  ): FindCourseSourceDto {
    return FindCourseSourceMapper.fromIdSourceValue(dto.idSourceValue);
  }

  public static fromUpsertCourseRequestDto(
    dto: UpsertCourseRequestDto
  ): FindCourseSourceDto {
    return FindCourseSourceMapper.fromIdSourceValue(dto.idSourceValue);
  }

  public static fromUpdateCourseRequestDto(
    dto: UpdateCourseRequestDto
  ): FindCourseSourceDto {
    if (!dto.idSourceValue) {
      throw new InternalRequestInvalidError('idSourceValue is required');
    }
    return FindCourseSourceMapper.fromIdSourceValue(dto.idSourceValue);
  }
}
