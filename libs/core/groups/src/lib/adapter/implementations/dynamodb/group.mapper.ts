import { DynamoDbMapper } from '@curioushuman/common';
import { GroupBase, isCourseGroupBase } from '../../../domain/entities/group';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';
import config from '../../../static/config';
import { DynamoDbGroupAttributes, DynamoDbGroupKeys } from './entities/group';
import { GroupsDynamoDbItem } from './entities/item';

/**
 * Mapping between domain and dynamodb
 */
export class DynamoDbGroupMapper {
  public static toDomain(item: GroupsDynamoDbItem): GroupBase {
    return GroupBase.check({
      _type: item.Group_Type,
      id: item.Group_Id,

      // other ids
      // standard
      slug: item.Group_Slug,
      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        GroupsDynamoDbItem,
        GroupSourceIdSource
      >(item, 'Group', config.defaults.accountSources),

      // course
      courseId: item.Group_CourseId,

      status: item.Group_Status,
      name: item.Group_Name,
      accountOwner: item.AccountOwner,
    });
  }

  /**
   * Function to define the composite keys
   *
   * TODO: later we could get fancier with this
   */
  public static toPersistenceKeys(group: GroupBase): DynamoDbGroupKeys {
    const sourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<GroupSourceIdSource>(
        group.sourceIds,
        'Group',
        config.defaults.accountSources,
        group.id
      );
    const skCourseId = isCourseGroupBase(group) ? group.id : undefined;
    return DynamoDbGroupKeys.check({
      // composite key
      primaryKey: group.id,
      sortKey: group.id,

      // index sort keys; group
      Sk_Group_Slug: group.id,
      Sk_Group_CourseId: skCourseId,
      ...sourceIds,

      // index sort keys; group member
      // none

      // index sort keys; member
      Sk_Member_Id: group.id,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    group: GroupBase
  ): DynamoDbGroupAttributes {
    const sourceIdFields =
      DynamoDbMapper.preparePersistenceSourceIdFields<GroupSourceIdSource>(
        group.sourceIds,
        'Group',
        config.defaults.accountSources
      );
    const courseId = isCourseGroupBase(group) ? group.courseId : undefined;
    return {
      Group_Type: group._type,
      Group_Id: group.id,
      ...sourceIdFields,

      Group_CourseId: courseId,

      Group_Slug: group.slug,
      Group_Status: group.status,
      Group_Name: group.name,

      AccountOwner: group.accountOwner,
    };
  }

  /**
   * Prepare Dynamodb record for saving
   */
  public static toPersistence(group: GroupBase): GroupsDynamoDbItem {
    const keys = DynamoDbGroupMapper.toPersistenceKeys(group);
    const attributes = DynamoDbGroupMapper.toPersistenceAttributes(group);
    return {
      ...keys,
      ...attributes,
    };
  }
}
