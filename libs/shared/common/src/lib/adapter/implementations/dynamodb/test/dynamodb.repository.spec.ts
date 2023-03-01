import { loadFeature, defineFeature } from 'jest-cucumber';

import { LoggableLogger } from '@curioushuman/loggable';
import { DynamoDbRepository } from '../repository';

type TestEntity = {
  id: string;
  name: string;
};

type TestEntityPersisted = {
  id: string;
  name: string;
};

// type TestItem = {
//   Test_Id: string;
//   Test_Name: string;
// };

/**
 * UNIT TEST
 * SUT = initiating a DynamoDbRepository
 *
 * Scope
 * - repository initialization only
 */

const feature = loadFeature('./dynamodb.repository.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let dynamoDbRepository: DynamoDbRepository<TestEntity, TestEntityPersisted>;

  beforeAll(() => {
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

  test('Successful instantiation of DynamoDb Repository', ({
    given,
    when,
    then,
  }) => {
    given('I have provide valid DynamoDb repository configuration', () => {
      // see beforeAll
    });

    when('I instantiate the repository', async () => {
      // see beforeAll
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
