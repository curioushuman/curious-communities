import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { MemberDto } from './dto/member.dto';
import {
  Member,
  prepareMemberExternalIdSource,
} from '../domain/entities/member';

/**
 * TODO
 * - Should we do more checking of MemberDto?
 */
export class MemberMapper {
  public static toResponseDto(member: Member): MemberDto {
    return MemberDto.check({
      id: member.id,
      status: member.status,
      sourceOrigin: member.sourceOrigin,
      sourceIds: member.sourceIds.map((idSource) =>
        prepareExternalIdSourceValue(idSource.id, idSource.source)
      ),

      name: member.name,
      email: member.email,
      organisationName: member.organisationName,

      accountOwner: member.accountOwner,
    });
  }

  public static fromResponseDto(dto: MemberDto): Member {
    return Member.check({
      id: dto.id,
      status: dto.status,
      sourceOrigin: dto.sourceOrigin,
      sourceIds: dto.sourceIds.map((idSourceValue) =>
        prepareMemberExternalIdSource(idSourceValue)
      ),

      name: dto.name,
      email: dto.email,
      organisationName: dto.organisationName,

      accountOwner: dto.accountOwner,
    });
  }
}
