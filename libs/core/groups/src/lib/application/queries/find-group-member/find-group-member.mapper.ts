import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindGroupMemberDto } from './find-group-member.dto';
import {
  FindByIdSourceValueGroupMemberRequestDto,
  FindByIdGroupMemberRequestDto,
  FindGroupMemberRequestDto,
  FindByEmailGroupMemberRequestDto,
} from '../../../infra/find-group-member/dto/find-group-member.request.dto';
import { GroupMemberId } from '../../../domain/value-objects/group-member-id';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import { Source } from '../../../domain/value-objects/source';
import { CreateGroupMemberRequestDto } from '../../../infra/create-course-group-member/dto/create-group-member.request.dto';
import { GroupMemberEmail } from '../../../domain/value-objects/group-member-email';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupMemberMapper {
  /**
   * As we use a similar construct when creating our groups,
   * we can share mapper functions.
   */
  public static fromFindRequestDto(
    dto: FindGroupMemberRequestDto
  ): FindGroupMemberDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    if ('id' in dto) {
      return FindGroupMemberMapper.fromFindByIdRequestDto({
        id: dto.id as string,
      });
    }
    if ('idSourceValue' in dto) {
      return FindGroupMemberMapper.fromFindByIdSourceValueRequestDto({
        idSourceValue: dto.idSourceValue as string,
      });
    }
    return FindGroupMemberMapper.fromFindByEmailRequestDto({
      email: dto.email as string,
    });
  }

  public static fromCreateRequestDto(
    dto: CreateGroupMemberRequestDto
  ): FindGroupMemberDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    if ('idSourceValue' in dto) {
      return FindGroupMemberMapper.fromFindByIdSourceValueRequestDto({
        idSourceValue: dto.idSourceValue as string,
      });
    }
    return FindGroupMemberMapper.fromFindByEmailRequestDto({
      email: dto.email as string,
    });
  }

  public static fromFindByIdRequestDto(
    dto: FindByIdGroupMemberRequestDto
  ): FindGroupMemberDto {
    // this will throw an error if the id is not valid
    const value = GroupMemberId.check(dto.id);
    return {
      identifier: 'id',
      value,
    } as FindGroupMemberDto;
  }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueGroupMemberRequestDto
  ): FindGroupMemberDto {
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      GroupMemberSourceId,
      Source
    );
    return {
      identifier: 'idSourceValue',
      value,
    } as FindGroupMemberDto;
  }

  public static fromFindByEmailRequestDto(
    dto: FindByEmailGroupMemberRequestDto
  ): FindGroupMemberDto {
    // this will throw an error if the id is not valid
    const value = GroupMemberEmail.check(dto.email);
    return {
      identifier: 'email',
      value,
    } as FindGroupMemberDto;
  }
}
