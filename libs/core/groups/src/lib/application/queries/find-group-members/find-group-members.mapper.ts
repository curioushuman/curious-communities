import { GroupId } from '../../../domain/value-objects/group-id';
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
    return {
      parentId: GroupId.check(dto.group.id),
    } as FindGroupMembersDto;
  }
}
