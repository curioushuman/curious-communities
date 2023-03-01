import {
  courseDynamoDbItem,
  courseDomainItem,
} from '../../../../../../__fixtures__';
import { DynamoDbCourseMapper } from '../course.mapper';
import { CourseBase } from '../../../../domain/entities/course';

/**
 * UNIT TEST
 * SUT = CourseMapper
 *
 * Scope
 * - mapping helper functions
 */

describe('CourseMapper', () => {
  test('when persistence item is valid, should convert into valid domain item', () => {
    const domainItem = DynamoDbCourseMapper.toDomain(courseDynamoDbItem);
    expect(domainItem).toMatchObject(courseDomainItem);
  });

  test('when domain item is valid, should convert into valid persistence item', () => {
    const persistenceItem = DynamoDbCourseMapper.toPersistence(
      CourseBase.check(courseDomainItem)
    );
    expect(persistenceItem).toMatchObject(courseDynamoDbItem);
  });
});
