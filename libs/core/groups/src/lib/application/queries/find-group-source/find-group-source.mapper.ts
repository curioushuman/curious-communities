import { parseExternalIdSourceValue } from '@curioushuman/common';

import { FindGroupSourceDto } from './find-group-source.dto';
import {
  FindByIdSourceValueGroupSourceRequestDto,
  FindGroupSourceRequestDto,
} from '../../../infra/find-group-source/dto/find-group-source.request.dto';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';
import { CreateGroupRequestDto } from '../../../infra/create-group/dto/create-group.request.dto';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { prepareGroupExternalIdSource } from '../../../domain/entities/group';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupSourceMapper {
  /**
   * As we use a similar construct when creating our groups,
   * we can share mapper functions.
   */
  public static fromFindRequestDto(
    dto: FindGroupSourceRequestDto | CreateGroupRequestDto
  ): FindGroupSourceDto {
    // NOTE: this is based on a model that inc. multiple identifiers
    return FindGroupSourceMapper.fromFindByIdSourceValueRequestDto({
      idSourceValue: dto.idSourceValue,
    });
  }

  public static fromFindByIdSourceValueRequestDto(
    dto: FindByIdSourceValueGroupSourceRequestDto
  ): FindGroupSourceDto {
    // this will throw an error if the value is not valid
    const value = parseExternalIdSourceValue(
      dto.idSourceValue,
      GroupSourceId,
      Source
    );
    return {
      identifier: 'idSource',
      value: prepareGroupExternalIdSource(value),
    } as FindGroupSourceDto;
  }

  public static fromUpsertRequestDto(
    dto: UpsertGroupSourceRequestDto
  ): FindGroupSourceDto | undefined {
    // look to see if we have a source id
    // for this source, for this group
    const idSourceValue = dto.group.sourceIds.find(
      (idSV) => idSV.indexOf(dto.source) === 0
    );
    // if we don't have them on record
    if (!idSourceValue) {
      return;
    }
    return {
      identifier: 'idSource',
      value: prepareGroupExternalIdSource(idSourceValue),
    } as FindGroupSourceDto;
  }

  public static fromIdSourceToId(idSource: GroupSourceIdSource): GroupSourceId {
    // this will throw an error if the id is not valid
    const parsedIdSource = GroupSourceIdSource.check(idSource);
    // this pulls the id out so it can be used on it's own
    return parsedIdSource.id as GroupSourceId;
  }
}
