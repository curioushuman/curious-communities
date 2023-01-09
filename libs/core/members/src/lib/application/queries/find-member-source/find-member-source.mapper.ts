import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindMemberSourceDto } from './find-member-source.dto';
import {
  FindByIdSourceValueMemberSourceRequestDto,
  FindMemberSourceRequestDto,
  FindByEmailMemberSourceRequestDto,
} from '../../../infra/find-member-source/dto/find-member-source.request.dto';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { Source } from '../../../domain/value-objects/source';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { CreateMemberRequestDto } from '../../../infra/create-member/dto/create-member.request.dto';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import { UpsertMemberSourceRequestDto } from '../../../infra/upsert-member-source/dto/upsert-member-source.request.dto';
import { prepareMemberExternalIdSource } from '../../../domain/entities/member';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindMemberSourceMapper {
  /**
   * As we use a similar construct when creating our members,
   * we can share mapper functions.
   */
  public static fromFindRequestDto(
    dto: FindMemberSourceRequestDto | CreateMemberRequestDto
  ): FindMemberSourceDto {
    // NOTE: at least one of the two will be defined
    // this check occurs in the controller
    return dto.idSourceValue
      ? FindMemberSourceMapper.fromFindByIdSourceValueRequestDto({
          idSourceValue: dto.idSourceValue,
        })
      : FindMemberSourceMapper.fromFindByEmailRequestDto({
          email: dto.email as string,
        });
  }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueMemberSourceRequestDto
  ): FindMemberSourceDto {
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      MemberSourceId,
      Source
    );
    return {
      identifier: 'idSource',
      value: prepareMemberExternalIdSource(value),
    } as FindMemberSourceDto;
  }

  public static fromFindByEmailRequestDto(
    dto: FindByEmailMemberSourceRequestDto
  ): FindMemberSourceDto {
    // this will throw an error if the id is not valid
    const value = MemberEmail.check(dto.email);
    return {
      identifier: 'email',
      value,
    } as FindMemberSourceDto;
  }

  public static fromUpsertRequestDto(
    dto: UpsertMemberSourceRequestDto
  ): FindMemberSourceDto {
    // look to see if we have a source id
    // for this source, for this member
    const idSourceValue = dto.member.sourceIds.find(
      (idSV) => idSV.indexOf(dto.source) === 0
    );
    // if we don't have them on record
    if (!idSourceValue) {
      // see if they exist in the external DB via their email
      return {
        identifier: 'email',
        value: MemberEmail.check(dto.member.email),
      } as FindMemberSourceDto;
    }
    return {
      identifier: 'idSource',
      value: prepareMemberExternalIdSource(idSourceValue),
    } as FindMemberSourceDto;
  }

  public static fromIdSourceToId(
    idSource: MemberSourceIdSource
  ): MemberSourceId {
    // this will throw an error if the id is not valid
    const parsedIdSource = MemberSourceIdSource.check(idSource);
    // this pulls the id out so it can be used on it's own
    return parsedIdSource.id as MemberSourceId;
  }
}
