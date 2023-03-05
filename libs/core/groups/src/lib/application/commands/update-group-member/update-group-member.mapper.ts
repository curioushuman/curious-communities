import { UpdateMapper } from '@curioushuman/common';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import {
  CourseGroupMember,
  CourseGroupMemberBase,
} from '../../../domain/entities/course-group-member';
import { isCourseGroupBase } from '../../../domain/entities/group';
import { GroupMember } from '../../../domain/entities/group-member';
import { ParticipantDto } from '../../../infra/dto/participant.dto';
import { GroupMemberMapper as InfraGroupMemberMapper } from '../../../infra/group-member.mapper';
import { GroupMemberMapper as DomainGroupMemberMapper } from '../../../domain/mappers/group-member.mapper';
import { MemberMapper } from '../../../infra/member.mapper';
import { UpdateGroupMemberRequestDto } from '../../../infra/update-group-member/dto/update-group-member.request.dto';
import { UpsertCourseGroupMemberRequestDto } from '../../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import {
  UpdateGroupMemberDto,
  UpdateGroupMemberDtoSource,
  UpdateGroupMemberDtoSourceFunction,
} from './update-group-member.dto';

export class UpdateGroupMemberMapper extends UpdateMapper {
  public static fromUpsertCourseGroupMemberRequestDto(
    groupMember: GroupMember
  ): (dto: UpsertCourseGroupMemberRequestDto) => UpdateGroupMemberDto {
    return (dto) =>
      ({ groupMember, participant: dto.participant } as UpdateGroupMemberDto);
  }

  public static fromUpdateGroupMemberRequestDto(
    dto: UpdateGroupMemberRequestDto
  ): UpdateGroupMemberDto {
    return {
      groupMember: InfraGroupMemberMapper.fromResponseDto(dto.groupMember),
    } as UpdateGroupMemberDto;
  }

  public static fromDto(dto: UpdateGroupMemberDto): GroupMember {
    // if only groupMember is present, return it
    if (Object.keys(dto).length === 1) {
      return dto.groupMember;
    }
    return UpdateGroupMemberMapper.fromDtoSource(dto);
  }

  public static fromDtoSource(dto: UpdateGroupMemberDto): GroupMember {
    const orderOfUpdate: Record<
      UpdateGroupMemberDtoSource,
      UpdateGroupMemberDtoSourceFunction
    > = {
      participant: UpdateGroupMemberMapper.fromSourceParticipant,
    };
    let groupMember: GroupMember | undefined = undefined;
    Object.keys(orderOfUpdate).forEach((key) => {
      if (key in dto && !groupMember) {
        groupMember = orderOfUpdate[key as UpdateGroupMemberDtoSource](dto)();
      }
    });
    return groupMember || dto.groupMember;
  }

  public static fromSourceParticipant = (
    dto: UpdateGroupMemberDto
  ): (() => GroupMember) => {
    const { groupMember, participant } = dto;
    if (!participant) {
      throw new InternalRequestInvalidError(
        'Attempting to update group member from participant, without the participant'
      );
    }
    return () => {
      return UpdateGroupMemberMapper.fromParticipantToGroupMember(
        participant,
        groupMember
      );
    };
  };

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

      status: DomainGroupMemberMapper.fromParticipantStatus(participant.status),
    });
    const member = MemberMapper.fromResponseDto(participant.member);
    return {
      ...updatedGroupMemberBase,
      group,
      member,
    };
  }
}
