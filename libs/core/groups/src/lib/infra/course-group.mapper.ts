import {
  CourseGroupBaseResponseDto,
  CourseGroupResponseDto,
} from './dto/course-group.response.dto';
import { CourseGroup, CourseGroupBase } from '../domain/entities/course-group';
import { StandardGroupMapper } from './standard-group.mapper';
import { CourseGroupMemberMapper } from './course-group-member.mapper';
import { CourseId } from '../domain/value-objects/course-id';

export class CourseGroupMapper {
  public static toResponseDto(group: CourseGroup): CourseGroupResponseDto {
    const base = CourseGroupMapper.toBaseResponseDto(group);
    return CourseGroupResponseDto.check({
      ...base,
      groupMembers: group.groupMembers.map(
        CourseGroupMemberMapper.toBaseResponseDto
      ),
    });
  }

  public static toBaseResponseDto(
    group: CourseGroup | CourseGroupBase
  ): CourseGroupBaseResponseDto {
    const standardBase = StandardGroupMapper.toBaseResponseDto(group);
    return {
      ...standardBase,
      courseId: group.courseId,
      _type: 'course',
    };
  }

  public static fromResponseDto(dto: CourseGroupResponseDto): CourseGroup {
    const base = CourseGroupMapper.fromResponseDtoToBase(dto);
    return {
      ...base,
      groupMembers: dto.groupMembers.map((member) =>
        CourseGroupMemberMapper.fromResponseDtoToBase(member)
      ),
    };
  }

  public static fromResponseDtoToBase(
    dto: CourseGroupResponseDto | CourseGroupBaseResponseDto
  ): CourseGroupBase {
    const standardBase = StandardGroupMapper.fromResponseDtoToBase(dto);
    return {
      ...standardBase,
      courseId: CourseId.check(dto.courseId),
    };
  }
}
