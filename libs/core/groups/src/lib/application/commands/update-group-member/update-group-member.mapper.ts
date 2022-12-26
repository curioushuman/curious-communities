import { UpdateGroupMemberDto } from './update-group-member.dto';
import { UpdateGroupMemberRequestDto } from '../../../infra/update-group-member/dto/update-group-member.request.dto';
import { FindGroupMemberSourceDto } from '../../queries/find-group-member-source/find-group-member-source.dto';
import { FindGroupMemberDto } from '../../queries/find-group-member/find-group-member.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateGroupMemberMapper {
  public static fromRequestDto(
    dto: UpdateGroupMemberRequestDto
  ): UpdateGroupMemberDto {
    return UpdateGroupMemberDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupMemberSourceDto(
    dto: UpdateGroupMemberDto
  ): FindGroupMemberSourceDto {
    return FindGroupMemberSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupMemberDto(
    dto: UpdateGroupMemberDto
  ): FindGroupMemberDto {
    return {
      identifier: 'id',
      value: dto.id,
    } as FindGroupMemberDto;
  }
}
