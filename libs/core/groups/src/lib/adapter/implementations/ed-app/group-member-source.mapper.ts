import {
  GroupMemberSource,
  GroupMemberSourceForCreate,
} from '../../../domain/entities/group-member-source';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import { EdAppApiGroupMemberSourceForCreate } from './entities/group-member-source';
import { EdAppApiMemberSource } from './entities/member-source';

export class EdAppApiGroupMemberSourceMapper {
  public static toDomain(
    sourceResponse: EdAppApiMemberSource,
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
  ): EdAppApiGroupMemberSourceForCreate {
    const entity: EdAppApiGroupMemberSourceForCreate = {
      userId: domainEntity.memberId,
    };
    return EdAppApiGroupMemberSourceForCreate.check(entity);
  }
}
