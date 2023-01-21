import { UpdateMapper } from '@curioushuman/common';

import { UpdateCourseGroupDto } from './update-course-group.dto';
import { UpdateCourseGroupRequestDto } from '../../../infra/update-course-group/dto/update-course-group.request.dto';
import { CourseGroup } from '../../../domain/entities/course-group';
import { CourseDto } from '../../../infra/dto/course.dto';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';

export class UpdateCourseGroupMapper extends UpdateMapper {
  public static fromRequestDto(
    dto: UpdateCourseGroupRequestDto
  ): UpdateCourseGroupDto {
    // The course will have already been validated
    return UpdateCourseGroupDto.check({ course: dto.course });
  }

  public static fromCourseToCourseGroup(
    course: CourseDto
  ): (courseGroup: CourseGroup) => CourseGroup {
    return (courseGroup: CourseGroup) =>
      CourseGroup.check({
        ...courseGroup,
        // NOTE: if the status' differ between course and group
        // add an additional map function to handle it
        status: course.status,
        slug: createGroupSlug(course.name),
        name: course.name,
      });
  }
}
