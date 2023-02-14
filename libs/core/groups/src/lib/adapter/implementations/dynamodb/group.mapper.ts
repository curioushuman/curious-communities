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

      //pk as group is the parent
      id: item.primaryKey,

      // sk is the same as pk

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
        config.defaults.accountSources
      );
    const courseId = isCourseGroupBase(group) ? group.courseId : undefined;
    return DynamoDbGroupKeys.check({
      primaryKey: group.id,
      sortKey: group.id,

      Sk_Group_Slug: group.slug,
      Sk_Group_CourseId: courseId,
      ...sourceIds,
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
