import { CourseGroup } from '../domain/entities/course-group';
import { ParticipantDto } from './dto/participant.dto';
import { GroupMemberForIdentify } from '../domain/entities/group-member';

/**
 * Mapper for course group related DTO objects
 */
export class CourseGroupMemberMapper {
  public static fromParticipantToCourseGroupMember(
    group: CourseGroup,
    participant: ParticipantDto
  ): GroupMemberForIdentify {
    return GroupMemberForIdentify.check({
      groupId: group.id,
      memberId: participant.memberId,
      // NOTE: if the status' differ between participant and group member
      // add an additional map function to handle it
      status: participant.status,

      sourceIds: [],

      name: participant.name,
      email: participant.email,
      organisationName: participant.organisationName,

      accountOwner: participant.accountOwner,
    });
  }
}
