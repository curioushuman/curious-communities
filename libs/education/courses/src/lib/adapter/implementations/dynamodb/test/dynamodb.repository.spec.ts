import { loadFeature, defineFeature } from 'jest-cucumber';

import { LoggableLogger } from '@curioushuman/loggable';
import { DynamoDbRepository } from '../dynamodb.repository';
import { CourseBase } from '../../../../domain/entities/course';

/**
 * INTEGRATION TEST
 * SUT = authenticating with an external repository
 * i.e. are we actually connecting with SF
 *
 * Scope
 * - repository authorisation
 *
 * NOTE: repository functions and behaviours handled in separate tests
 */

const feature = loadFeature('./dynamodb.repository.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let dynamoDbRepository: DynamoDbRepository<CourseBase>;

  test('Successful instantiation of DynamoDb Repository', ({
    given,
    when,
    then,
  }) => {
    given('I have provide valid DynamoDb repository configuration', () => {
      // see next
    });

    when('I instantiate the repository', async () => {
      dynamoDbRepository = new DynamoDbRepository(
        new LoggableLogger('TEST'),
        'course',
        'courses',
        ['slug', 'source-id-value'],
        'cc'
      );
    });

    then('I should receive a valid repository instance', () => {
      // allow for missing env var
      const prefix = 'Cc';
      expect(dynamoDbRepository.getEntityName()).toEqual('Course');
      expect(dynamoDbRepository.getTableName()).toEqual(
        `${prefix}CoursesDynamoDbTable`
      );
      expect(dynamoDbRepository.getLocalIndexes()).toMatchObject({
        slug: `${prefix}CoursesCourseSlugDynamoDbLsi`,
        'source-id-value': `${prefix}CoursesCourseSourceIdValueDynamoDbLsi`,
      });
    });
  });
});
