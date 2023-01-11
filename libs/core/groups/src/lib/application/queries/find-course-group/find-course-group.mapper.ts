import { FindCourseGroupDto } from './find-course-group.dto';
import { MutateCourseGroupMemberRequestDto } from '../../../infra/dto/mutate-course-group-member.request.dto';
import { CourseId } from '../../../domain/value-objects/course-id';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindCourseGroupMapper {
  /**
   * Both create and update course group member requests have the same structure
   */
  public static fromMutateCourseGroupMemberRequestDto(
    dto: MutateCourseGroupMemberRequestDto
  ): FindCourseGroupDto {
    return {
      identifier: 'courseId',
      value: CourseId.check(dto.participant.courseId),
    };
  }
}
