import { CreateCourseGroupDto } from './create-course-group.dto';
import { CourseGroupBase } from '../../../domain/entities/course-group';
import { createGroupId } from '../../../domain/value-objects/group-id';
import config from '../../../static/config';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';
import { CourseDto } from '../../../infra/dto/course.dto';
import { CreateCourseGroupRequestDto } from '../../../infra/create-course-group/dto/create-course-group.request.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCourseGroupMapper {
  public static fromRequestDto(
    dto: CreateCourseGroupRequestDto
  ): CreateCourseGroupDto {
    const group = CreateCourseGroupMapper.fromCourseToCourseGroup(dto.course);
    return { group } as CreateCourseGroupDto;
  }

  public static fromCourseToCourseGroup(course: CourseDto): CourseGroupBase {
    return CourseGroupBase.check({
      id: createGroupId(),
      courseId: course.id,
      // NOTE: if the status' differ between course and group
      // add an additional map function to handle it
      status: course.status,
      type: config.defaults.courseGroupType,
      slug: createGroupSlug(course.name),

      sourceIds: [],

      name: course.name,

      accountOwner: course.accountOwner,
    });
  }
}
