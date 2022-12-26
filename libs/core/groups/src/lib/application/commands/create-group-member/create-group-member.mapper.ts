import { CreateGroupMemberDto } from './create-group-member.dto';
import { CreateGroupMemberRequestDto } from '../../../infra/create-group-member/dto/create-group-member.request.dto';
import { FindGroupMemberSourceDto } from '../../queries/find-group-member-source/find-group-member-source.dto';
import { FindGroupMemberDto } from '../../queries/find-group-member/find-group-member.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateGroupMemberMapper {
  public static fromRequestDto(
    dto: CreateGroupMemberRequestDto
  ): CreateGroupMemberDto {
    return CreateGroupMemberDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupMemberSourceDto(
    dto: CreateGroupMemberDto
  ): FindGroupMemberSourceDto {
    return FindGroupMemberSourceDto.check({
      id: dto.id,
    });
  }

  public static toFindGroupMemberDto(
    dto: CreateGroupMemberDto
  ): FindGroupMemberDto {
    return {
      identifier: 'id',
      value: dto.id,
    } as FindGroupMemberDto;
  }
}
