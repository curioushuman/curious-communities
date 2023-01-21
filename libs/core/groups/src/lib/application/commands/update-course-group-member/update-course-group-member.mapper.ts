import { UpdateMapper } from '@curioushuman/common';

import { UpdateCourseGroupMemberDto } from './update-course-group-member.dto';
import { CourseGroup } from '../../../domain/entities/course-group';
import { MutateCourseGroupMemberRequestDto } from '../../../infra/dto/mutate-course-group-member.request.dto';
import { CourseGroupMemberMapper } from '../../../infra/course-group-member.mapper';
import {
  GroupMemberBase,
  GroupMemberForIdentify,
} from '../../../domain/entities/group-member';

export class UpdateCourseGroupMemberMapper extends UpdateMapper {
  public static fromRequestDto(
    group: CourseGroup
  ): (dto: MutateCourseGroupMemberRequestDto) => UpdateCourseGroupMemberDto {
    return (dto: MutateCourseGroupMemberRequestDto) => {
      const groupMember =
        CourseGroupMemberMapper.fromParticipantToCourseGroupMember(
          group,
          dto.participant
        );
      return UpdateCourseGroupMemberDto.check({
        groupMember,
      });
    };
  }

  /**
   * The group group member will have been built
   * carefully prior to this point. So we should be
   * able to accept all of it.
   */
  public static toGroupMember(
    unidentifiedGroupMember: GroupMemberForIdentify
  ): (groupMember: GroupMemberBase) => GroupMemberBase {
    return (groupMember: GroupMemberBase) => {
      return GroupMemberBase.check({
        ...unidentifiedGroupMember,
        id: groupMember.id,
      });
    };
  }
}
