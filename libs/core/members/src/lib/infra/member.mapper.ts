import { prepareExternalIdSourceValue } from '@curioushuman/common';

import { MemberResponseDto } from './dto/member.response.dto';
import {
  Member,
  prepareMemberExternalIdSource,
} from '../domain/entities/member';

/**
 * TODO
 * - Should we do more checking of MemberResponseDto?
 */
export class MemberMapper {
  public static toResponseDto(member: Member): MemberResponseDto {
    return MemberResponseDto.check({
      id: member.id,
      status: member.status,

      sourceIds: member.sourceIds.map((idSource) =>
        prepareExternalIdSourceValue(idSource.id, idSource.source)
      ),

      name: member.name,
      email: member.email,
      organisationName: member.organisationName,

      accountOwner: member.accountOwner,
    });
  }

  public static fromResponseDto(dto: MemberResponseDto): Member {
    return Member.check({
      id: dto.id,
      status: dto.status,

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
