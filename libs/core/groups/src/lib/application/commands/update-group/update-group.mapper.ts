import { UpdateMapper } from '@curioushuman/common';
import { Group, GroupBase } from '../../../domain/entities/group';
import { GroupSource } from '../../../domain/entities/group-source';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';
import { CourseDto } from '../../../infra/dto/course.dto';
import { UpsertCourseGroupRequestDto } from '../../../infra/upsert-course-group/dto/upsert-course-group.request.dto';
import { UpdateGroupDto } from './update-group.dto';
import { CourseGroupBase } from '../../../domain/entities/course-group';
import { StandardGroupBase } from '../../../domain/entities/standard-group';

export class UpdateGroupMapper extends UpdateMapper {
  public static fromUpsertCourseGroupRequestDto(
    group: Group | GroupBase
  ): (dto: UpsertCourseGroupRequestDto) => UpdateGroupDto {
    return (dto: UpsertCourseGroupRequestDto) => ({
      group,
      course: dto.course,
    });
  }

  public static fromDto(dto: UpdateGroupDto): GroupBase {
    // Type casting here as we know if course is null then groupSource is not null
    return dto.course
      ? UpdateGroupMapper.fromCourseToGroup(dto.course, dto.group)
      : UpdateGroupMapper.fromSourceToGroup(
          dto.groupSource as GroupSource,
          dto.group
        );
  }

  public static fromCourseToGroup(
    course: CourseDto,
    group: GroupBase
  ): CourseGroupBase {
    return CourseGroupBase.check({
      ...group,
      id: group.id,
      slug: createGroupSlug(course.name),
      name: course.name,
    });
  }

  public static fromSourceToGroup(
    source: GroupSource,
    group: GroupBase
  ): StandardGroupBase {
    return StandardGroupBase.check({
      ...group,
      id: group.id,
      slug: createGroupSlug(source.name),
      name: source.name,
    });
  }
}
