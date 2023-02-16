import { FindGroupMemberSourceDto } from './find-group-member-source.dto';
import { Source } from '../../../domain/value-objects/source';
import { findSourceIdValue } from '@curioushuman/common';
import { UpsertGroupMemberSourceRequestDto } from '../../../infra/upsert-group-member-source/dto/upsert-group-member-source.request.dto';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { prepareGroupExternalIdSource } from '../../../domain/entities/group';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { prepareMemberExternalIdSource } from '../../../domain/entities/member';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';

export class FindGroupMemberSourceMapper {
  public static fromUpsertRequestDto(
    dto: UpsertGroupMemberSourceRequestDto
  ): FindGroupMemberSourceDto {
    const groupSourceIdSourceValue = findSourceIdValue(
      dto.groupMember.group.sourceIds,
      dto.source
    );
    if (!groupSourceIdSourceValue) {
      throw new InternalRequestInvalidError(
        'Group source id not found when attempting to find group member source.'
      );
    }
    // TODO: I would prefer not to do this here
    // should have been handled within prepareGroupExternalIdSource()
    const parentId = prepareGroupExternalIdSource(groupSourceIdSourceValue)
      .id as GroupSourceId;
    const memberSourceIdSourceValue = findSourceIdValue(
      dto.groupMember.member.sourceIds,
      dto.source
    );
    if (memberSourceIdSourceValue) {
      const memberSourceId = prepareMemberExternalIdSource(
        memberSourceIdSourceValue
      ).id as MemberSourceId;
      return {
        identifier: 'memberId',
        value: memberSourceId,
        source: Source.check(dto.source),

        parentId,
      };
    }
    return {
      identifier: 'memberEmail',
      value: MemberEmail.check(dto.groupMember.member.email),
      source: Source.check(dto.source),
      parentId,
    };
  }
}
