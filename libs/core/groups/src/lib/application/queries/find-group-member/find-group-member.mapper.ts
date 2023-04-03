import { GroupBase } from '../../../domain/entities/group';
import { UpdateGroupMemberRequestDto } from '../../../infra/update-group-member/dto/update-group-member.request.dto';
import { UpsertCourseGroupMemberRequestDto } from '../../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
import { UpsertGroupMemberSourceRequestDtoInput } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { FindGroupMemberDto } from './find-group-member.dto';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupMemberMapper {
  public static fromUpsertCourseGroupMemberRequestDto(
    group: GroupBase
  ): (dto: UpsertCourseGroupMemberRequestDto) => FindGroupMemberDto {
    return (dto: UpsertCourseGroupMemberRequestDto) => {
      return {
        identifier: 'participantId',
        value: dto.participant.id,
        parentId: group.id,
      } as FindGroupMemberDto;
    };
  }

  public static fromUpdateGroupMemberRequestDto(
    dto: UpdateGroupMemberRequestDto
  ): FindGroupMemberDto {
    return {
      identifier: 'memberId',
      value: dto.groupMember.memberId,
      parentId: dto.groupMember.groupId,
    } as FindGroupMemberDto;
  }

  /**
   * TODO:
   * - [ ] would make more sense to use id
   */
  public static fromUpsertGroupMemberSourceRequestDtoInput(
    dto: UpsertGroupMemberSourceRequestDtoInput
  ): FindGroupMemberDto {
    return {
      identifier: 'memberId',
      value: dto.groupMember.memberId,
      parentId: dto.groupMember.groupId,
    } as FindGroupMemberDto;
  }
}
