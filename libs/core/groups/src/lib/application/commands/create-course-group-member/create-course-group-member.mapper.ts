import { CreateCourseGroupMemberDto } from './create-course-group-member.dto';
import { GroupMemberBase } from '../../../domain/entities/group-member';
import { CourseGroup } from '../../../domain/entities/course-group';
import { createGroupMemberId } from '../../../domain/value-objects/group-member-id';
import { MutateCourseGroupMemberRequestDto } from '../../../infra/dto/mutate-course-group-member.request.dto';
import { CourseGroupMemberMapper } from '../../../infra/course-group-member.mapper';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateCourseGroupMemberMapper {
  public static fromRequestDto(
    group: CourseGroup
  ): (dto: MutateCourseGroupMemberRequestDto) => CreateCourseGroupMemberDto {
    return (dto: MutateCourseGroupMemberRequestDto) => {
      const fromParticipant =
        CourseGroupMemberMapper.fromParticipantToCourseGroupMember(
          group,
          dto.participant
        );
      return {
        groupMember: GroupMemberBase.check({
          ...fromParticipant,
          id: createGroupMemberId(),
        }),
      };
    };
  }
}
