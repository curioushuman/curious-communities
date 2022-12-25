import { CreateMemberDto } from './create-member.dto';
import { CreateMemberRequestDto } from '../../../infra/create-member/dto/create-member.request.dto';
import { FindMemberSourceDto } from '../../queries/find-member-source/find-member-source.dto';
import { FindMemberDto } from '../../queries/find-member/find-member.dto';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateMemberMapper {
  public static fromRequestDto(dto: CreateMemberRequestDto): CreateMemberDto {
    return CreateMemberDto.check({
      externalId: dto.externalId,
    });
  }

  public static toFindMemberSourceDto(
    dto: CreateMemberDto
  ): FindMemberSourceDto {
    return FindMemberSourceDto.check({
      id: dto.externalId,
    });
  }

  public static toFindMemberDto(dto: CreateMemberDto): FindMemberDto {
    return {
      identifier: 'externalId',
      value: dto.externalId,
    } as FindMemberDto;
  }
}
