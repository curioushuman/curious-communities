import { loadFeature, defineFeature } from 'jest-cucumber';

import { LoggableLogger } from '@curioushuman/loggable';
import { DynamoDbRepository } from '../dynamodb.repository';

type TestEntity = {
  id: string;
  name: string;
};

type TestEntityPersisted = {
  id: string;
  name: string;
};

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
  let dynamoDbRepository: DynamoDbRepository<TestEntity, TestEntityPersisted>;

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
        {
          entityId: 'course',
          tableId: 'courses',
          localIndexIds: ['name'],
          globalIndexIds: ['slug', 'source-id-value'],
          prefix: 'cc',
        },
        new LoggableLogger('TEST')
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
        name: `${prefix}CoursesCourseNameDynamoDbLSI`,
      });
      expect(dynamoDbRepository.getGlobalIndexes()).toMatchObject({
        slug: `${prefix}CoursesCourseSlugDynamoDbGSI`,
        'source-id-value': `${prefix}CoursesCourseSourceIdValueDynamoDbGSI`,
      });
    });
  });
});
