import { MemberResponseDto } from './dto/member.response.dto';
import { Member } from '../domain/entities/member';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

/**
 * TODO
 * - Should we do more checking of MemberResponseDto?
 */
export class MemberMapper {
  public static toResponseDto(member: Member): MemberResponseDto {
    return {
      id: member.id,
      status: member.status,

      sourceIds: member.sourceIds.map((idSource) =>
        prepareExternalIdSourceValue(idSource.id, idSource.source)
      ),

      name: member.name,
      email: member.email,
      organisationName: member.organisationName,
    } as MemberResponseDto;
  }
}
