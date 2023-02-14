import {
  CourseGroupMember,
  CourseGroupMemberBase,
} from '../domain/entities/course-group-member';
import { GroupMember } from '../domain/entities/group-member';
import { CourseId } from '../domain/value-objects/course-id';
import { ParticipantId } from '../domain/value-objects/participant-id';
import { CourseGroupMapper } from './course-group.mapper';
import {
  CourseGroupMemberBaseResponseDto,
  CourseGroupMemberResponseDto,
} from './dto/course-group-member.response.dto';
import { StandardGroupMemberMapper } from './standard-group-member.mapper';

export class CourseGroupMemberMapper {
  public static toResponseDto(
    groupMember: CourseGroupMember
  ): CourseGroupMemberResponseDto {
    const base = CourseGroupMemberMapper.toBaseResponseDto(groupMember);
    return {
      ...base,
      group: CourseGroupMapper.toBaseResponseDto(groupMember.group),
    };
  }

  public static toBaseResponseDto(
    groupMember: CourseGroupMember | CourseGroupMemberBase
  ): CourseGroupMemberBaseResponseDto {
    const standardBase =
      StandardGroupMemberMapper.toBaseResponseDto(groupMember);
    return {
      ...standardBase,
      courseId: groupMember.courseId,
      participantId: groupMember.participantId,
    };
  }

  public static fromResponseDto(
    dto: CourseGroupMemberResponseDto
  ): GroupMember {
    const base = CourseGroupMemberMapper.fromResponseDtoToBase(dto);
    return {
      ...base,
      group: CourseGroupMapper.fromResponseDtoToBase(dto.group),
    };
  }

  public static fromResponseDtoToBase(
    dto: CourseGroupMemberResponseDto | CourseGroupMemberBaseResponseDto
  ): CourseGroupMemberBase {
    const standardBase = StandardGroupMemberMapper.fromResponseDtoToBase(dto);
    return {
      ...standardBase,
      courseId: CourseId.check(dto.courseId),
      participantId: ParticipantId.check(dto.participantId),
    };
  }
}
