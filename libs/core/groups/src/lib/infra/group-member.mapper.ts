import { StandardGroupMemberMapper } from './standard-group-member.mapper';
import {
  GroupMemberBaseResponseDto,
  GroupMemberResponseDto,
} from './dto/group-member.response.dto';
import {
  GroupMember,
  isCourseGroupMember,
} from '../domain/entities/group-member';
import { CourseGroupMemberMapper } from './course-group-member.mapper';
import { isCourseGroupMemberResponseDto } from './dto/course-group-member.response.dto';

export class GroupMemberMapper {
  public static fromResponseDto(dto: GroupMemberResponseDto): GroupMember {
    return isCourseGroupMemberResponseDto(dto)
      ? CourseGroupMemberMapper.fromResponseDto(dto)
      : StandardGroupMemberMapper.fromResponseDto(dto);
  }

  public static toResponseDto(
    groupMember: GroupMember
  ): GroupMemberResponseDto {
    return isCourseGroupMember(groupMember)
      ? CourseGroupMemberMapper.toResponseDto(groupMember)
      : StandardGroupMemberMapper.toResponseDto(groupMember);
  }

  public static toBaseResponseDto(
    groupMember: GroupMember
  ): GroupMemberBaseResponseDto {
    return isCourseGroupMember(groupMember)
      ? CourseGroupMemberMapper.toBaseResponseDto(groupMember)
      : StandardGroupMemberMapper.toBaseResponseDto(groupMember);
  }
}
