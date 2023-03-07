import { GroupBase } from '../../../domain/entities/group';
import { GroupSource } from '../../../domain/entities/group-source';
import { createGroupId } from '../../../domain/value-objects/group-id';
import { createGroupSlug } from '../../../domain/value-objects/group-slug';
import { CourseDto } from '../../../infra/dto/course.dto';
import { UpsertCourseGroupRequestDto } from '../../../infra/upsert-course-group/dto/upsert-course-group.request.dto';
import config from '../../../static/config';
import { CreateGroupDto } from './create-group.dto';
import { CourseGroupBase } from '../../../domain/entities/course-group';
import { StandardGroupBase } from '../../../domain/entities/standard-group';
import { GroupMapper } from '../../../domain/mappers/group.mapper';

export class CreateGroupMapper {
  public static fromUpsertCourseGroupRequestDto(
    dto: UpsertCourseGroupRequestDto
  ): CreateGroupDto {
    return { course: dto.course } as CreateGroupDto;
  }

  public static fromDto(dto: CreateGroupDto): GroupBase {
    // Type casting here as we know if course is null then groupSource is not null
    return dto.course
      ? CreateGroupMapper.fromCourseToGroup(dto.course)
      : CreateGroupMapper.fromSourceToGroup(dto.groupSource as GroupSource);
  }

  public static fromCourseToGroup(course: CourseDto): CourseGroupBase {
    return CourseGroupBase.check({
      _type: config.defaults.groupTypeCourse,
      id: createGroupId(),
      courseId: course.id,
      sourceIds: [],
      slug: createGroupSlug(course.name),
      status: GroupMapper.fromCourseStatus(course.status),
      name: course.name,
      accountOwner: course.accountOwner,
    });
  }

  /**
   * ! THIS IS UNFINISHED
   * We haven't had to employ it yet
   * I just wanted to make sure we could support it
   */
  public static fromSourceToGroup(source: GroupSource): StandardGroupBase {
    return StandardGroupBase.check({
      _type: config.defaults.groupTypeStandard,
      id: createGroupId(),
      sourceOrigin: source.source,
      sourceIds: [
        {
          id: source.id,
          source: source.source,
        },
      ],
      slug: createGroupSlug(source.name),
      status: config.defaults.groupStatus,
      name: source.name,
      accountOwner: config.defaults.accountOwner,
    });
  }
}
