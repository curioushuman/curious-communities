import { StandardGroupMemberMapper } from './standard-group-member.mapper';
import { GroupMemberResponseDto } from './dto/group-member-response.dto';
import { GroupMember } from '../domain/entities/group-member';
import { CourseGroupMemberMapper } from './course-group-member.mapper';
import { isCourseGroupMemberResponseDto } from './dto/course-group-member.response.dto';

export class GroupMemberMapper {
  public static fromResponseDto(dto: GroupMemberResponseDto): GroupMember {
    return isCourseGroupMemberResponseDto(dto)
      ? CourseGroupMemberMapper.fromResponseDto(dto)
      : StandardGroupMemberMapper.fromResponseDto(dto);
  }
}
