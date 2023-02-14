import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { CourseGroupBase } from '../../../domain/entities/course-group';
import {
  CourseGroupMember,
  CourseGroupMemberBase,
} from '../../../domain/entities/course-group-member';
import { GroupBase, isCourseGroupBase } from '../../../domain/entities/group';
import { GroupMember } from '../../../domain/entities/group-member';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { ParticipantDto } from '../../../domain/entities/participant.dto';
import { StandardGroupMember } from '../../../domain/entities/standard-group-member';
import { createGroupMemberId } from '../../../domain/value-objects/group-member-id';
import { GroupMemberType } from '../../../domain/value-objects/group-member-type';
import { UpsertCourseGroupMemberRequestDto } from '../../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import config from '../../../static/config';
import { CreateGroupMemberDto } from './create-group-member.dto';

export class CreateGroupMemberMapper {
  public static fromUpsertCourseGroupMemberRequestDto(
    group: CourseGroupBase
  ): (dto: UpsertCourseGroupMemberRequestDto) => CreateGroupMemberDto {
    return (dto) =>
      ({ group, participant: dto.participant } as CreateGroupMemberDto);
  }

  public static fromDto(dto: CreateGroupMemberDto): GroupMember {
    // Type casting here as we know if participant is null then groupMemberSource is not null
    return dto.participant
      ? CreateGroupMemberMapper.fromParticipantToGroupMember(
          dto.participant,
          dto.group
        )
      : CreateGroupMemberMapper.fromSourceToGroupMember(
          dto.groupMemberSource as GroupMemberSource,
          dto.group
        );
  }

  public static fromParticipantToGroupMember(
    participant: ParticipantDto,
    group: GroupBase
  ): CourseGroupMember {
    if (!isCourseGroupBase(group)) {
      throw new InternalRequestInvalidError(
        'Attempting to update incorrect group member type'
      );
    }
    const groupMemberBase = CourseGroupMemberBase.check({
      _type: config.defaults.groupTypeCourse as GroupMemberType,
      id: createGroupMemberId(),
      groupId: group.id,
      courseId: group.courseId,
      participantId: participant.id,
      memberId: participant.memberId,
      sourceIds: [
        {
          id: participant.id,
          source: config.defaults.primaryAccountSource,
        },
      ],

      // TODO: mapping of participant status to GM statuses
      status: participant.status,

      name: participant.name,
      email: participant.email,
      organisationName: participant.organisationName,

      accountOwner: participant.accountOwner,
    });
    return {
      ...groupMemberBase,
      group,
    };
  }

  /**
   * ! THIS IS UNFINISHED
   * We haven't had to employ it yet
   * I just wanted to make sure we could support it
   */
  public static fromSourceToGroupMember(
    source: GroupMemberSource,
    group: GroupBase
  ): StandardGroupMember {
    return StandardGroupMember.check({
      _type: config.defaults.groupTypeStandard,
      id: createGroupMemberId(),
      groupId: group.id,
      memberId: 'TBD',
      sourceIds: [
        {
          id: source.id,
          source: source.source,
        },
      ],
      status: source.status,

      name: source.name,
      email: source.email,
      organisationName: source.organisationName,

      accountOwner: 'TBD',
    });
  }
}
