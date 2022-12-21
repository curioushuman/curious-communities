import { UpdateCourseDto } from './update-course.dto';
import { UpdateCourseRequestDto } from '../../../infra/update-course/dto/update-course.request.dto';
import { FindCourseSourceDto } from '../../queries/find-course-source/find-course-source.dto';
import { FindCourseDto } from '../../queries/find-course/find-course.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateCourseMapper {
  public static fromRequestDto(dto: UpdateCourseRequestDto): UpdateCourseDto {
    return UpdateCourseDto.check({
      id: dto.id,
    });
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
      identifier: 'id',
      value: dto.id,
    } as FindCourseDto;
  }
}
