import { FindGroupSourceDto } from './find-group-source.dto';
import { prepareGroupExternalIdSource } from '../../../domain/entities/group';
import { Source } from '../../../domain/value-objects/source';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { findSourceIdValue } from '@curioushuman/common';
import { GroupName } from '../../../domain/value-objects/group-name';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';

export class FindGroupSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertGroupSourceRequestDto
  ): FindGroupSourceDto {
    const idSourceValue = findSourceIdValue(dto.group.sourceIds, dto.source);
    if (idSourceValue) {
      return {
        identifier: 'idSource',
        value: prepareGroupExternalIdSource(idSourceValue),
        source: Source.check(dto.source),
      };
    }
    return {
      identifier: 'name',
      value: GroupName.check(dto.group.name),
      source: Source.check(dto.source),
    };
  }

  public static fromUpsertGroupMemberSourceRequestDto(
    dto: UpsertGroupMemberSourceRequestDto
  ): FindGroupSourceDto {
    const idSourceValue = findSourceIdValue(
      dto.groupMember.group.sourceIds,
      dto.source
    );
    if (!idSourceValue) {
      throw new InternalRequestInvalidError(
        'Group source id not found when attempting to upsert group member.'
      );
    }
    return {
      identifier: 'idSource',
      value: prepareGroupExternalIdSource(idSourceValue),
      source: Source.check(dto.source),
    };
  }
}
