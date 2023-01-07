import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindMemberDto } from './find-member.dto';
import {
  FindByIdSourceValueMemberRequestDto,
  FindByIdMemberRequestDto,
  FindMemberRequestDto,
  FindByEmailMemberRequestDto,
} from '../../../infra/find-member/dto/find-member.request.dto';
import { MemberId } from '../../../domain/value-objects/member-id';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { Source } from '../../../domain/value-objects/source';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { CreateMemberRequestDto } from '../../../infra/create-member/dto/create-member.request.dto';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindMemberMapper {
  /**
   * As we use a similar construct when creating our members,
   * we can share mapper functions.
   */
  public static fromFindRequestDto(
    dto: FindMemberRequestDto | CreateMemberRequestDto
  ): FindMemberDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    if ('id' in dto) {
      return FindMemberMapper.fromFindByIdRequestDto({
        id: dto.id as string,
      });
    }
    return dto.idSourceValue
      ? FindMemberMapper.fromFindByIdSourceValueRequestDto({
          idSourceValue: dto.idSourceValue,
        })
      : FindMemberMapper.fromFindByEmailRequestDto({
          email: dto.email as string,
        });
  }

  public static fromFindByIdRequestDto(
    dto: FindByIdMemberRequestDto
  ): FindMemberDto {
    // this will throw an error if the id is not valid
    const value = MemberId.check(dto.id);
    return {
      identifier: 'id',
      value,
    } as FindMemberDto;
  }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueMemberRequestDto
  ): FindMemberDto {
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

  public static fromFindByEmailRequestDto(
    dto: FindByEmailMemberRequestDto
  ): FindMemberDto {
    // this will throw an error if the id is not valid
    const value = MemberEmail.check(dto.email);
    return {
      identifier: 'email',
      value,
    } as FindMemberDto;
  }
}
