import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
} from '../../../domain/entities/group-member-source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import {
  TribeApiGroupMemberSource,
  TribeApiGroupMemberSourceForCreate,
} from './entities/group-member-source';

export class TribeApiGroupMemberSourceMapper {
  public static toDomain(
    sourceResponse: TribeApiGroupMemberSource,
    source: Source,
    groupId: GroupSourceId
  ): GroupMemberSource {
    return GroupMemberSource.check({
      id: sourceResponse.id,
      groupId,
      source,
      status: config.defaults.groupStatus,
      name: sourceResponse.profile.name,
      email: sourceResponse.email,
      organisationName: 'Not provided',
    });
  }

  /**
   * It is here that we add in the necessary defaults
   */
  public static toSourceForCreate(
    domainEntity: GroupMemberSourceForCreate
  ): TribeApiGroupMemberSourceForCreate {
    const entity = {
      user: domainEntity.id,
    };
    return TribeApiGroupMemberSourceForCreate.check(entity);
  }
}
