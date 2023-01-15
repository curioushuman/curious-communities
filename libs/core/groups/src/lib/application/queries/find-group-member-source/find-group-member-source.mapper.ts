import { FindGroupMemberSourceDto } from './find-group-member-source.dto';
import { GroupMemberSourceId } from '../../../domain/value-objects/group-member-source-id';
import {
  GroupMemberSourceIdSource,
  GroupMemberSourceIdSourceValue,
} from '../../../domain/value-objects/group-member-source-id-source';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { prepareGroupMemberExternalIdSource } from '../../../domain/entities/group-member';
import { GroupMemberMapper } from '../../../infra/group-member.mapper';
import { Source } from '../../../domain/value-objects/source';

/**
 * TODO
 * - find base abstract class for mappers
 */
export class FindGroupMemberSourceMapper {
  /**
   * Little sneaky function to make sure the Array.find method knows what type
   * it is dealing with.
   */
  public static matchIdSourceBySource(
    source: string
  ): (idSourceValue: GroupMemberSourceIdSourceValue) => boolean {
    return (idSourceValue: GroupMemberSourceIdSourceValue) =>
      idSourceValue.indexOf(source) === 0;
  }

  public static fromUpsertRequestDto(
    dto: UpsertGroupMemberSourceRequestDto
  ): FindGroupMemberSourceDto | undefined {
    // look to see if we have a source id
    // for this source, for this group
    const idSourceValue = dto.groupMember.sourceIds.find(
      FindGroupMemberSourceMapper.matchIdSourceBySource(dto.source)
    );

    // I do want to check the source here
    // as this isn't dynamic like the identifier
    const source = Source.check(dto.source);

    // if we don't have them on internal record
    if (!idSourceValue) {
      return {
        identifier: 'entity',
        // * NOTE: I'm not going to do extra validation for identify here
        // * as it **IS** done in query handler due to it's dynamic nature
        value: GroupMemberMapper.fromResponseDto(dto.groupMember),
        source,
      } as FindGroupMemberSourceDto;
    }

    return {
      identifier: 'idSource',
      value: prepareGroupMemberExternalIdSource(idSourceValue),
      source,
    } as FindGroupMemberSourceDto;
  }

  public static fromIdSourceToId(
    idSource: GroupMemberSourceIdSource
  ): GroupMemberSourceId {
    // this will throw an error if the id is not valid
    const parsedIdSource = GroupMemberSourceIdSource.check(idSource);
    // this pulls the id out so it can be used on it's own
    return parsedIdSource.id as GroupMemberSourceId;
  }
}
