import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';
import { UpsertMemberSourceRequestDto } from '../../../infra/upsert-member-source/dto/upsert-member-source.request.dto';
import { UpdateMemberSourceDto } from './update-member-source.dto';
import { MemberMapper } from '../../../infra/member.mapper';

/**
 * TODO
 * - update base abstract class for mappers
 */
export class UpdateMemberSourceMapper {
  public static fromUpsertRequestDto(
    memberSource: MemberSource
  ): (dto: UpsertMemberSourceRequestDto) => UpdateMemberSourceDto {
    return (dto: UpsertMemberSourceRequestDto) => ({
      member: MemberMapper.fromResponseDto(dto.member),
      memberSource,
    });
  }

  public static fromMemberToSource(
    memberSource: MemberSource
  ): (member: Member) => MemberSource {
    return (member: Member) => ({
      id: memberSource.id,
      source: memberSource.source,
      status: member.status,
      name: member.name,
      email: member.email,
      organisationName: member.organisationName,
    });
  }
}
