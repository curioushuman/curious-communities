import { CreateCourseDto } from './create-course.dto';
import { CreateCourseRequestDto } from '../../../infra/create-course/dto/create-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { CourseSource } from '../../../domain/entities/course-source';
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

  public static fromSourceToFindCourseDto(source: CourseSource): FindCourseDto {
    return {
      identifier: 'id',
      value: source.id,
    } as FindCourseDto;
  }
}
