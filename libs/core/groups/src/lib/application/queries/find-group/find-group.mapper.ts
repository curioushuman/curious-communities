import { FindGroupDto } from './find-group.dto';
import { UpsertCourseGroupRequestDto } from '../../../infra/upsert-course-group/dto/upsert-course-group.request.dto';
import { UpsertCourseGroupMemberRequestDto } from '../../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import { UpdateGroupMemberRequestDto } from '../../../infra/update-group-member/dto/update-group-member.request.dto';
import { UpdateGroupRequestDto } from '../../../infra/update-group/dto/update-group.request.dto';

export class FindGroupMapper {
  public static fromUpsertCourseGroupRequestDto(
    dto: UpsertCourseGroupRequestDto
  ): FindGroupDto {
    return {
      identifier: 'courseId',
      value: dto.course.id,
    } as FindGroupDto;
  }

  public static fromUpsertCourseGroupMemberRequestDto(
    dto: UpsertCourseGroupMemberRequestDto
  ): FindGroupDto {
    return {
      identifier: 'courseId',
      value: dto.participant.courseId,
    } as FindGroupDto;
  }

  public static fromUpdateGroupMemberRequestDto(
    dto: UpdateGroupMemberRequestDto
  ): FindGroupDto {
    return {
      identifier: 'id',
      value: dto.groupMember.groupId,
    } as FindGroupDto;
  }

  public static fromUpdateGroupRequestDto(
    dto: UpdateGroupRequestDto
  ): FindGroupDto {
    return {
      identifier: 'id',
      value: dto.group.id,
    } as FindGroupDto;
  }
}
