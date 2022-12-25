import { UpdateMemberDto } from './update-member.dto';
import { UpdateMemberRequestDto } from '../../../infra/update-member/dto/update-member.request.dto';
import { FindMemberSourceDto } from '../../queries/find-member-source/find-member-source.dto';
import { FindMemberDto } from '../../queries/find-member/find-member.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateMemberMapper {
  public static fromRequestDto(dto: UpdateMemberRequestDto): UpdateMemberDto {
    return UpdateMemberDto.check({
      externalId: dto.externalId,
    });
  }

  public static toFindMemberSourceDto(
    dto: UpdateMemberDto
  ): FindMemberSourceDto {
    return FindMemberSourceDto.check({
      id: dto.externalId,
    });
  }

  public static toFindMemberDto(dto: UpdateMemberDto): FindMemberDto {
    return {
      identifier: 'externalId',
      value: dto.externalId,
    } as FindMemberDto;
  }
}
