import { MemberSourceForCreate } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';
import { UpsertMemberSourceRequestDto } from '../../../infra/upsert-member-source/dto/upsert-member-source.request.dto';
import { CreateMemberSourceDto } from './create-member-source.dto';
import { MemberMapper } from '../../../infra/member.mapper';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class CreateMemberSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertMemberSourceRequestDto
  ): CreateMemberSourceDto {
    return {
      source: Source.check(dto.source),
      member: MemberMapper.fromResponseDto(dto.member),
    };
  }

  public static fromMemberToSource(member: Member): MemberSourceForCreate {
    return MemberSourceForCreate.check({
      status: member.status,

      name: member.name,
      email: member.email,
      organisationName: member.organisationName,
    });
  }
}
