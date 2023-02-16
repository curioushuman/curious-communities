import { GroupBase } from '../../../domain/entities/group';
import { UpsertCourseGroupMemberRequestDto } from '../../../infra/upsert-course-group-member/dto/upsert-course-group-member.request.dto';
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
}
