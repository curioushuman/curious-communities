import { UpdateMapper } from '@curioushuman/common';
import { Group, GroupBase } from '../../../domain/entities/group';
import { GroupSource } from '../../../domain/entities/group-source';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';
import { CourseDto } from '../../../infra/dto/course.dto';
import { UpsertCourseGroupRequestDto } from '../../../infra/upsert-course-group/dto/upsert-course-group.request.dto';
import { UpdateGroupDto } from './update-group.dto';
import { CourseGroupBase } from '../../../domain/entities/course-group';
import { StandardGroupBase } from '../../../domain/entities/standard-group';
import { GroupMapper as DomainGroupMapper } from '../../../domain/mappers/group.mapper';
import { GroupMapper as InfraGroupMapper } from '../../..//infra/group.mapper';
import config from '../../../static/config';
import { UpdateGroupRequestDto } from '../../../infra/update-group/dto/update-group.request.dto';

export class UpdateGroupMapper extends UpdateMapper {
  public static fromUpsertCourseGroupRequestDto(
    group: Group | GroupBase
  ): (dto: UpsertCourseGroupRequestDto) => UpdateGroupDto {
    return (dto: UpsertCourseGroupRequestDto) => ({
      group,
      course: dto.course,
    });
  }

  public static fromUpdateGroupRequestDto(
    dto: UpdateGroupRequestDto
  ): UpdateGroupDto {
    return {
      group: InfraGroupMapper.fromResponseDtoToBase(dto.group),
    };
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
      status: DomainGroupMapper.fromCourseStatus(course.status),
    });
  }

  /**
   * ! THIS IS UNFINISHED
   * We haven't had to employ it yet
   * I just wanted to make sure we could support it
   */
  public static fromSourceToGroup(
    source: GroupSource,
    group: GroupBase
  ): StandardGroupBase {
    return StandardGroupBase.check({
      ...group,
      id: group.id,
      slug: createGroupSlug(source.name),
      name: source.name,
      status: config.defaults.groupStatus,
    });
  }
}
