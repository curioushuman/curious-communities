import { GroupId } from '../../../domain/value-objects/group-id';
import { MemberId } from '../../../domain/value-objects/member-id';
import { UpdateGroupMemberMultiRequestDto } from '../../../infra/update-group-member-multi/dto/update-group-member-multi.request.dto';
import { FindGroupMembersDto } from './find-group-members.dto';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupMembersMapper {
  public static fromUpdateGroupMemberMultiRequestDto(
    dto: UpdateGroupMemberMultiRequestDto
  ): FindGroupMembersDto {
    const findDto: FindGroupMembersDto = {};
    if (dto.group) {
      findDto.parentId = GroupId.check(dto.group.id);
    }
    if (dto.member) {
      findDto.filters = {
        memberId: MemberId.check(dto.member.id),
      };
    }
    return FindGroupMembersDto.check(findDto);
  }
}
