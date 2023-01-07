import { MemberSourceResponseDto } from './dto/member-source.response.dto';
import { MemberSource } from '../domain/entities/member-source';

/**
 * TODO
 * - Should we do more checking of MemberSourceResponseDto?
 */
export class MemberSourceMapper {
  public static toResponseDto(
    memberSource: MemberSource
  ): MemberSourceResponseDto {
    return {
      id: memberSource.id,
      status: memberSource.status,

      name: memberSource.name,
      email: memberSource.email,
      organisationName: memberSource.organisationName,
    } as MemberSourceResponseDto;
  }
}
