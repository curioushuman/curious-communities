import { FindCourseSourceDto } from './find-course-source.dto';
import { CreateCourseRequestDto } from '../../../infra/create-course/dto/create-course.request.dto';
import { prepareCourseExternalIdSource } from '../../../domain/entities/course';
import config from '../../../static/config';
import { Source } from '../../../domain/value-objects/source';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindCourseSourceMapper {
  /**
   * NOTE: currently hard coded to default source
   * if we ever move to multiple possible sources
   * draw from your other microservices e.g. groups
   */
  public static fromCreateCourseRequestDto(
    dto: CreateCourseRequestDto
  ): FindCourseSourceDto {
    return {
      identifier: 'idSource',
      value: prepareCourseExternalIdSource(dto.idSourceValue),
      source: Source.check(config.defaults.primaryAccountSource),
    };
  }

  /**
   * NOTE: currently hard coded to default source
   * if we ever move to multiple possible sources
   * draw from your other microservices e.g. groups
   */
  public static fromUpdateCourseRequestDto(
    dto: UpdateCourseRequestDto
  ): FindCourseSourceDto {
    return {
      identifier: 'idSource',
      value: prepareCourseExternalIdSource(dto.idSourceValue),
      source: Source.check(config.defaults.primaryAccountSource),
    };
  }
}
