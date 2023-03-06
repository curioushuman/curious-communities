import { CourseId } from '../../../domain/value-objects/course-id';
import { MemberId } from '../../../domain/value-objects/member-id';
import { UpdateParticipantMultiRequestDto } from '../../../infra/update-participant-multi/dto/update-participant-multi.request.dto';
import { FindParticipantsDto } from './find-participants.dto';

export class FindParticipantsMapper {
  public static fromUpdateParticipantMultiRequestDto(
    dto: UpdateParticipantMultiRequestDto
  ): FindParticipantsDto {
    const findDto: FindParticipantsDto = {};
    if (dto.course) {
      findDto.parentId = CourseId.check(dto.course.id);
    }
    if (dto.member) {
      findDto.filters = {
        memberId: MemberId.check(dto.member.id),
      };
    }
    return FindParticipantsDto.check(findDto);
  }
}
