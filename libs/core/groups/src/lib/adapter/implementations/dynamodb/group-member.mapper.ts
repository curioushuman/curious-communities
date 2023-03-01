import { DynamoDbMapper } from '@curioushuman/common';
import {
  GroupMember,
  isCourseGroupMember,
} from '../../../domain/entities/group-member';
import config from '../../../static/config';
import { DynamoDbGroupMapper } from './group.mapper';
import { GroupsDynamoDbItem } from './entities/item';
import {
  DynamoDbGroupMemberAttributes,
  DynamoDbGroupMemberKeys,
} from './entities/group-member';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';
import { DynamoDbMemberMapper } from './member.mapper';
import { CourseGroupMemberBase } from '../../../domain/entities/course-group-member';
import { StandardGroupMemberBase } from '../../../domain/entities/standard-group-member';

export class DynamoDbGroupMemberMapper {
  public static toDomain(item: GroupsDynamoDbItem): GroupMember {
    const group = DynamoDbGroupMapper.toDomain(item);
    const member = DynamoDbMemberMapper.toDomain(item);
    const checkGroupMemberBase =
      item.GroupMember_Type === 'course'
        ? CourseGroupMemberBase.check
        : StandardGroupMemberBase.check;
    const groupMemberBase = checkGroupMemberBase({
      _type: item.GroupMember_Type,
      id: item.GroupMember_Id,
      groupId: item.Group_Id,

      // other ids
      // standard
      memberId: item.Member_Id,

      // course
      courseId: item.Group_CourseId,
      participantId: item.GroupMember_ParticipantId,

      // other fields
      status: item.GroupMember_Status,
      accountOwner: item.AccountOwner,
    });
    return {
      ...groupMemberBase,
      group,
      member,
    };
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
    const groupSourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<GroupSourceIdSource>(
        groupMember.group.sourceIds,
        'Group',
        config.defaults.accountSources,
        groupMember.id
      );
    // if not a course group member leave this field blank
    // that way it is not included in the courseId index
    const skCourseId = isCourseGroupMember(groupMember)
      ? groupMember.id
      : undefined;
    return DynamoDbGroupMemberKeys.check({
      // composite key
      primaryKey: groupMember.groupId,
      sortKey: groupMember.id,

      // index sort keys; group
      // TODO: this is the part that, if separate, could be called from the group mapper
      Sk_Group_Slug: groupMember.id,
      Sk_Group_CourseId: skCourseId,
      ...groupSourceIds,

      // index sort keys; groupMember
      Sk_GroupMember_ParticipantId: skCourseId,

      // index sort keys; member
      Sk_Member_Id: groupMember.id,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    groupMember: GroupMember
  ): DynamoDbGroupMemberAttributes {
    const participantId = isCourseGroupMember(groupMember)
      ? groupMember.participantId
      : undefined;
    return {
      GroupMember_Type: groupMember._type,
      GroupMember_Id: groupMember.id,

      GroupMember_ParticipantId: participantId,

      GroupMember_Status: groupMember.status,
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
    const memberAttributes = DynamoDbMemberMapper.toPersistenceAttributes(
      groupMember.member
    );
    return {
      ...keys,
      ...attributes,
      ...groupAttributes,
      ...memberAttributes,
    };
  }
}
