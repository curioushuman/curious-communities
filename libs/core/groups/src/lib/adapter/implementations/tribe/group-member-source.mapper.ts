import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
} from '../../../domain/entities/group-member-source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import { TribeApiGroupMemberSourceForCreate } from './entities/group-member-source';
import { TribeApiMemberSource } from './entities/member-source';

export class TribeApiGroupMemberSourceMapper {
  public static toDomain(
    sourceResponse: TribeApiMemberSource,
    source: Source,
    groupId: GroupSourceId
  ): GroupMemberSource {
    return GroupMemberSource.check({
      source,
      groupId,
      memberId: sourceResponse.id,
      memberEmail: sourceResponse.email,
      status: config.defaults.groupStatus,
    });
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: GroupMemberSourceForCreate
  ): TribeApiGroupMemberSourceForCreate {
    const entity = {
      user: domainEntity.memberId,
    };
    return TribeApiGroupMemberSourceForCreate.check(entity);
  }
}
