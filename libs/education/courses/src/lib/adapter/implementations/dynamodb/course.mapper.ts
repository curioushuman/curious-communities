import { DynamoDbMapper } from '@curioushuman/common';
import { CourseBase } from '../../../domain/entities/course';
import { CourseSourceIdSource } from '../../../domain/value-objects/course-source-id-source';
import config from '../../../static/config';
import {
  DynamoDbCourseAttributes,
  DynamoDbCourseKeys,
} from './entities/course';
import { CoursesDynamoDbItem } from './entities/item';

/**
 * Mapping between domain and dynamodb
 */
export class DynamoDbCourseMapper {
  public static toDomain(item: CoursesDynamoDbItem): CourseBase {
    return CourseBase.check({
      id: item.primaryKey,

      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        CoursesDynamoDbItem,
        CourseSourceIdSource
      >(item, 'Course', config.defaults.accountSources),

      slug: item.Course_Slug,
      status: item.Course_Status,
      supportType: item.Course_SupportType,
      name: item.Course_Name,
      dateOpen: item.Course_DateOpen,
      dateClosed: item.Course_DateClosed,

      accountOwner: item.AccountOwner,
    });
  }

  /**
   * Function to define the composite keys
   *
   * TODO: later we could get fancier with this
   */
  public static toPersistenceKeys(course: CourseBase): DynamoDbCourseKeys {
    const sourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<CourseSourceIdSource>(
        course.sourceIds,
        'Course',
        config.defaults.accountSources
      );
    return DynamoDbCourseKeys.check({
      primaryKey: course.id,
      sortKey: course.id,

      Sk_Course_Slug: course.slug,
      ...sourceIds,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    course: CourseBase
  ): DynamoDbCourseAttributes {
    const sourceIdFields =
      DynamoDbMapper.preparePersistenceSourceIdFields<CourseSourceIdSource>(
        course.sourceIds,
        'Course',
        config.defaults.accountSources
      );
    return {
      ...sourceIdFields,

      Course_Slug: course.slug,
      Course_Status: course.status,
      Course_SupportType: course.supportType,
      Course_Name: course.name,
      Course_DateOpen: course.dateOpen,
      Course_DateClosed: course.dateClosed,

      AccountOwner: course.accountOwner,
    };
  }

  /**
   * Prepare Dynamodb record for saving
   */
  public static toPersistence(course: CourseBase): CoursesDynamoDbItem {
    const keys = DynamoDbCourseMapper.toPersistenceKeys(course);
    const attributes = DynamoDbCourseMapper.toPersistenceAttributes(course);
    return {
      ...keys,
      ...attributes,
    };
  }
}
