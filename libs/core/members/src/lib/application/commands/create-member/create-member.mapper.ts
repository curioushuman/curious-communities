import { CreateMemberDto } from './create-member.dto';
import { CreateMemberRequestDto } from '../../../infra/create-member/dto/create-member.request.dto';
import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';
import { createMemberId } from '../../../domain/value-objects/member-id';
import config from '../../../static/config';
import { FindMemberMapper } from '../../queries/find-member/find-member.mapper';
import { FindMemberSourceMapper } from '../../queries/find-member-source/find-member-source.mapper';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateMemberMapper {
  public static fromRequestDto(dto: CreateMemberRequestDto): CreateMemberDto {
    // NOTE: the DTO values are validated in these other mappers
    const findMemberDto = FindMemberMapper.fromFindRequestDto(dto);
    const findMemberSourceDto = FindMemberSourceMapper.fromFindRequestDto(dto);
    return {
      findMemberDto,
      findMemberSourceDto,
    };
  }

  public static fromSourceToMember(source: MemberSource): Member {
    return Member.check({
      id: createMemberId(),
      status: source.status,

      sourceIds: [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ],

      name: source.name,
      email: source.email,
      organisationName: source.organisationName,

      accountOwner: config.defaults.accountOwner,
    });
  }
}
