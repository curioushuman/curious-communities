import { parseExternalIdSourceValue } from '@curioushuman/common';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';

import { FindMemberDto } from './find-member.dto';
import { FindMemberRequestDto } from '../../../infra/find-member/dto/find-member.request.dto';
import { MemberId } from '../../../domain/value-objects/member-id';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { Source } from '../../../domain/value-objects/source';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { UpdateMemberRequestDto } from '../../../infra/update-member/dto/update-member.request.dto';
import { MemberSourceIdSourceValue } from '../../../domain/value-objects/member-source-id-source';

/**
 * TODO
 * - consolidate some of these similar functions
 */
export class FindMemberMapper {
  /**
   * As we use a similar construct when creating our members,
   * we can share mapper functions.
   */
  public static fromFindRequestDto(dto: FindMemberRequestDto): FindMemberDto {
    let findDto: FindMemberDto | undefined;
    const mappers = [
      FindMemberMapper.fromFindById,
      FindMemberMapper.fromFindByIdSourceValue,
      FindMemberMapper.fromFindByEmail,
    ];
    for (const mapper of mappers) {
      if (!findDto) {
        findDto = mapper(dto);
      }
    }
    if (!findDto) {
      throw new InternalRequestInvalidError(
        'Invalid request. Please provide a valid identifier.'
      );
    }
    return findDto;
  }

  public static fromFindById(
    dto: FindMemberRequestDto
  ): FindMemberDto | undefined {
    if (!MemberId.guard(dto.id)) {
      return;
    }
    return {
      identifier: 'id',
      value: dto.id,
    } as FindMemberDto;
  }

  public static fromFindByIdSourceValue(
    dto: FindMemberRequestDto
  ): FindMemberDto | undefined {
    if (!MemberSourceIdSourceValue.guard(dto.idSourceValue)) {
      return;
    }
    return {
      identifier: 'idSourceValue',
      value: dto.idSourceValue,
    } as FindMemberDto;
  }

  public static fromFindByEmail(
    dto: FindMemberRequestDto
  ): FindMemberDto | undefined {
    if (!MemberEmail.guard(dto.email)) {
      return;
    }
    return {
      identifier: 'email',
      value: dto.email,
    } as FindMemberDto;
  }

  public static fromUpdateMemberRequestDto(
    dto: UpdateMemberRequestDto
  ): FindMemberDto {
    if (!dto.idSourceValue) {
      throw new InternalRequestInvalidError('idSourceValue is required');
    }
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      MemberSourceId,
      Source
    );
    return {
      identifier: 'idSourceValue',
      value,
    } as FindMemberDto;
  }
}
