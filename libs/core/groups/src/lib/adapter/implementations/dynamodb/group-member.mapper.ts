import { DynamoDbMapper } from '@curioushuman/common';
import {
  GroupMember,
  isCourseGroupMember,
} from '../../../domain/entities/group-member';
import { GroupMemberSourceIdSource } from '../../../domain/value-objects/group-member-source-id-source';
import config from '../../../static/config';
import { DynamoDbGroupMapper } from './group.mapper';
import { GroupsDynamoDbItem } from './entities/item';
import {
  DynamoDbGroupMemberAttributes,
  DynamoDbGroupMemberKeys,
} from './entities/group-member';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';

export class DynamoDbGroupMemberMapper {
  public static toDomain(item: GroupsDynamoDbItem): GroupMember {
    const group = DynamoDbGroupMapper.toDomain(item);
    return GroupMember.check({
      _type: item.GroupMember_Type,

      // IMPORTANT: this is sk, not pk. Always check the keys method below
      id: item.sortKey,

      // as it's a child, it's stored in the parent (DDB) collection
      groupId: item.primaryKey,

      // other ids
      // standard
      memberId: item.GroupMember_MemberId,
      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        GroupsDynamoDbItem,
        GroupMemberSourceIdSource
      >(item, 'GroupMember', config.defaults.accountSources),

      // course
      courseId: item.Group_CourseId,
      participantId: item.GroupMember_ParticipantId,

      // other fields
      status: item.GroupMember_Status,
      name: item.GroupMember_Name,
      email: item.GroupMember_Email,
      organisationName: item.GroupMember_OrganisationName,
      accountOwner: item.AccountOwner,

      group,
    });
  }

  /**
   * Function to define the composite keys
   *
   * TODO:
   * - [ ] later we could get fancier with this
   * - [ ] would be better if this were two functions
   *       1. composite keys; pk and sk only
   *       2. other keys; all the other keys
   */
  public static toPersistenceKeys(
    groupMember: GroupMember
  ): DynamoDbGroupMemberKeys {
    const sourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<GroupMemberSourceIdSource>(
        groupMember.sourceIds,
        'GroupMember',
        config.defaults.accountSources
      );
    const groupSourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<GroupSourceIdSource>(
        groupMember.group.sourceIds,
        'Group',
        config.defaults.accountSources
      );
    const courseId = isCourseGroupMember(groupMember)
      ? groupMember.courseId
      : undefined;
    return DynamoDbGroupMemberKeys.check({
      // composite key
      primaryKey: groupMember.groupId,
      sortKey: groupMember.id,

      // other keys; group member
      ...sourceIds,

      // other keys; group
      // TODO: this is the part that, if separate, could be called from the group mapper
      Sk_Group_Slug: groupMember.group.slug,
      Sk_Group_CourseId: courseId,
      ...groupSourceIds,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    groupMember: GroupMember
  ): DynamoDbGroupMemberAttributes {
    const sourceIdFields =
      DynamoDbMapper.preparePersistenceSourceIdFields<GroupMemberSourceIdSource>(
        groupMember.sourceIds,
        'GroupMember',
        config.defaults.accountSources
      );
    const participantId = isCourseGroupMember(groupMember)
      ? groupMember.participantId
      : undefined;
    return {
      GroupMember_Type: groupMember._type,

      ...sourceIdFields,

      GroupMember_GroupId: groupMember.groupId,
      GroupMember_MemberId: groupMember.memberId,

      GroupMember_ParticipantId: participantId,
      // NOTE: Group_CourseId will be added in groupAttributes (below)
      // Group_CourseId: courseId,

      GroupMember_Status: groupMember.status,
      GroupMember_Name: groupMember.name,
      GroupMember_Email: groupMember.email,
      GroupMember_OrganisationName: groupMember.organisationName,

      AccountOwner: groupMember.accountOwner,
    };
  }

  /**
   * Prepare Dynamodb record for saving
   *
   * NOTE: we're returning a DynamoDbItem here, not a DynamoDbGroupMember.
   * The reason is that DynamoDb needs a complete record in place, this is
   * just how it works.
   */
  public static toPersistence(groupMember: GroupMember): GroupsDynamoDbItem {
    const keys = DynamoDbGroupMemberMapper.toPersistenceKeys(groupMember);
    const attributes =
      DynamoDbGroupMemberMapper.toPersistenceAttributes(groupMember);
    const groupAttributes = DynamoDbGroupMapper.toPersistenceAttributes(
      groupMember.group
    );
    return {
      ...keys,
      ...attributes,
      ...groupAttributes,
    };
  }
}
