import { FindGroupSourceDto } from './find-group-source.dto';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import {
  GroupSourceIdSource,
  GroupSourceIdSourceValue,
} from '../../../domain/value-objects/group-source-id-source';
import { UpsertGroupSourceRequestDto } from '../../../infra/upsert-group-source/dto/upsert-group-source.request.dto';
import { prepareGroupExternalIdSource } from '../../../domain/entities/group';
import { GroupMapper } from '../../../infra/group.mapper';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupSourceMapper {
  /**
   * Little sneaky function to make sure the Array.find method knows what type
   * it is dealing with.
   */
  public static matchIdSourceBySource(
    source: string
  ): (idSourceValue: GroupSourceIdSourceValue) => boolean {
    return (idSourceValue: GroupSourceIdSourceValue) =>
      idSourceValue.indexOf(source) === 0;
  }

  public static fromUpsertRequestDto(
    dto: UpsertGroupSourceRequestDto
  ): FindGroupSourceDto | undefined {
    // look to see if we have a source id
    // for this source, for this group
    const idSourceValue = dto.group.sourceIds.find(
      FindGroupSourceMapper.matchIdSourceBySource(dto.source)
    );

    // I do want to check the source here
    // as this isn't dynamic like the identifier
    const source = Source.check(dto.source);

    // if we don't have them on internal record
    if (!idSourceValue) {
      return {
        identifier: 'entity',
        value: GroupMapper.fromResponseDto(dto.group),
        source,
      } as FindGroupSourceDto;
    }
    return {
      identifier: 'idSource',
      value: prepareGroupExternalIdSource(idSourceValue),
      source,
    } as FindGroupSourceDto;
  }

  public static fromIdSourceToId(idSource: GroupSourceIdSource): GroupSourceId {
    // this will throw an error if the id is not valid
    const parsedIdSource = GroupSourceIdSource.check(idSource);
    // this pulls the id out so it can be used on it's own
    return parsedIdSource.id as GroupSourceId;
  }
}
