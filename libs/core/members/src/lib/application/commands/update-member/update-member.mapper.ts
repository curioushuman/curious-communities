import { UpdateMemberDto } from './update-member.dto';
import { UpdateMemberRequestDto } from '../../../infra/update-member/dto/update-member.request.dto';
import { FindMemberSourceDto } from '../../queries/find-member-source/find-member-source.dto';
import { FindMemberDto } from '../../queries/find-member/find-member.dto';
import {
  prepareExternalIdSource,
  prepareExternalIdSourceValue,
} from '@curioushuman/common';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { Source } from '../../../domain/value-objects/source';
import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';

/**
 * TODO
 * - create base abstract class for mappers
 */
export class UpdateMemberMapper {
  public static fromRequestDto(dto: UpdateMemberRequestDto): UpdateMemberDto {
    const idSource = prepareExternalIdSource(
      dto.idSourceValue,
      MemberSourceId,
      Source
    );
    return UpdateMemberDto.check(idSource);
  }

  public static toFindMemberSourceDto(
    dto: UpdateMemberDto
  ): FindMemberSourceDto {
    // by the time it gets to here, it's been validated already
    return {
      identifier: 'idSource',
      value: dto,
    };
  }

  public static toFindMemberDto(dto: UpdateMemberDto): FindMemberDto {
    return {
      identifier: 'idSourceValue',
      value: prepareExternalIdSourceValue(dto.id, dto.source),
    } as FindMemberDto;
  }

  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing member, and the source that will be overriding it
   *
   * NOTE: we do NOT update everything from the source
   */
  public static fromSourceToMember(
    member: Member
  ): (source: MemberSource) => Member {
    return (source: MemberSource) => {
      return Member.check({
        ...member,
        status: source.status,

        name: source.name,
        email: source.email,
        organisationName: source.organisationName,
      });
    };
  }
}
