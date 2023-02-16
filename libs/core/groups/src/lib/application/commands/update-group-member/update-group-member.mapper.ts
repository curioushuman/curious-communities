import { UpdateMapper } from '@curioushuman/common';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import {
  CourseGroupMember,
  CourseGroupMemberBase,
} from '../../../domain/entities/course-group-member';
import { isCourseGroupBase } from '../../../domain/entities/group';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { StandardGroupMember } from '../../../domain/entities/standard-group-member';
import { ParticipantDto } from '../../../infra/dto/participant.dto';
import { MemberMapper } from '../../../infra/member.mapper';
import { UpsertCourseGroupMemberRequestDto } from '../../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import { UpdateGroupMemberDto } from './update-group-member.dto';

export class UpdateGroupMemberMapper extends UpdateMapper {
  public static fromUpsertCourseGroupMemberRequestDto(
    groupMember: GroupMember
  ): (dto: UpsertCourseGroupMemberRequestDto) => UpdateGroupMemberDto {
    return (dto) =>
      ({ groupMember, participant: dto.participant } as UpdateGroupMemberDto);
  }

  public static fromDto(dto: UpdateGroupMemberDto): GroupMember {
    // Type casting here as we know if participant is null then groupMemberSource is not null
    return dto.participant
      ? UpdateGroupMemberMapper.fromParticipantToGroupMember(
          dto.participant,
          dto.groupMember
        )
      : UpdateGroupMemberMapper.fromSourceToGroupMember(
          dto.groupMemberSource as GroupMemberSource,
          dto.groupMember
        );
  }

  public static fromParticipantToGroupMember(
    participant: ParticipantDto,
    groupMember: GroupMember
  ): CourseGroupMember {
    const { group, ...groupMemberBase } = groupMember;
    if (!isCourseGroupBase(group)) {
      throw new InternalRequestInvalidError(
        'Attempting to update incorrect group member type'
      );
    }
    const updatedGroupMemberBase = CourseGroupMemberBase.check({
      ...groupMemberBase,
      id: groupMember.id,

      // TODO: mapping of participant status to GM statuses
      status: participant.status,
    });
    const member = MemberMapper.fromResponseDto(participant.member);
    return {
      ...updatedGroupMemberBase,
      group,
      member,
    };
  }

  /**
   * ! THIS IS UNFINISHED
   * We haven't had to employ it yet
   * I just wanted to make sure we could support it
   */
  public static fromSourceToGroupMember(
    source: GroupMemberSource,
    groupMember: GroupMember
  ): StandardGroupMember {
    return StandardGroupMember.check({
      ...groupMember,
      id: groupMember.id,
      status: source.status,
    });
  }
}
