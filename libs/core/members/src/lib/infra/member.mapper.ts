import { MemberResponseDto } from './dto/member.response.dto';
import { Member } from '../domain/entities/member';

/**
 * TODO
 * - Should we do more checking of MemberResponseDto?
 */
export class MemberMapper {
  public static toResponseDto(member: Member): MemberResponseDto {
    return {
      externalId: member.externalId,
      status: member.status,
      slug: member.slug,
      name: member.name,
      email: member.email,
      organisationName: member.organisationName,
    } as MemberResponseDto;
  }
}
