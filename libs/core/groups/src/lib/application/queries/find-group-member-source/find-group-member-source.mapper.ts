import { FindGroupMemberSourceDto } from './find-group-member-source.dto';
import { prepareGroupMemberExternalIdSource } from '../../../domain/entities/group-member';
import { Source } from '../../../domain/value-objects/source';
import { findSourceIdValue } from '@curioushuman/common';
import { GroupMemberEmail } from '../../../domain/value-objects/group-member-email';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { prepareGroupExternalIdSource } from '../../../domain/entities/group';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';

export class FindGroupMemberSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertGroupMemberSourceRequestDto
  ): FindGroupMemberSourceDto {
    const groupIdSourceValue = findSourceIdValue(
      dto.groupMember.group.sourceIds,
      dto.source
    );
    if (!groupIdSourceValue) {
      throw new InternalRequestInvalidError(
        'Group source id not found when attempting to find group member.'
      );
    }
    const groupIdSource = prepareGroupExternalIdSource(groupIdSourceValue);
    const idSourceValue = findSourceIdValue(
      dto.groupMember.sourceIds,
      dto.source
    );
    if (idSourceValue) {
      return {
        identifier: 'idSource',
        value: prepareGroupMemberExternalIdSource(idSourceValue),
        source: Source.check(dto.source),
        // TODO: I would prefer not to do this here
        // should have been handled within prepareGroupExternalIdSource()
        parentId: GroupSourceId.check(groupIdSource.id),
      };
    }
    return {
      identifier: 'email',
      value: GroupMemberEmail.check(dto.groupMember.email),
      source: Source.check(dto.source),
      // TODO: I would prefer not to do this here
      // should have been handled within prepareGroupExternalIdSource()
      parentId: GroupSourceId.check(groupIdSource.id),
    };
  }
}
