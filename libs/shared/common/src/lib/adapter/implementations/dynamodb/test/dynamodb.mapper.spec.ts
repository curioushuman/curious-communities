import { SourceInvalidError } from '@curioushuman/error-factory';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { DynamoDbMapper } from '../mapper';
import { TestSourceIdSource } from './value-objects//test-source-id-source';

type TestItem = {
  partitionKey: string;
  sortKey: string;
  Test_SourceIdALPHA: string;
  Test_SourceIdBETA: string;
};

/**
 * UNIT TEST
 * SUT = DynamoDbMapper
 *
 * Scope
 * - mapping helper functions
 */

const feature = loadFeature('./dynamodb.mapper.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let itemValid: TestItem;
  let persistenceSourceFieldsValid: Record<string, string | undefined>;
  let sourceIdsValid: TestSourceIdSource[];
  const sources = ['ALPHA', 'BETA'];

  beforeAll(() => {
    persistenceSourceFieldsValid = {
      Test_SourceIdALPHA: 'ALPHA#a123',
      Test_SourceIdBETA: 'BETA#b234',
    };
    itemValid = {
      partitionKey: 'test1',
      sortKey: 'test2',
      Test_SourceIdALPHA: 'ALPHA#a123',
      Test_SourceIdBETA: 'BETA#b234',
    };
    sourceIdsValid = [
      {
        id: 'a123',
        source: 'ALPHA',
      },
      {
        id: 'b234',
        source: 'BETA',
      },
    ];
  });

  test('Successful preparation of domain source ids', ({
    given,
    when,
    then,
  }) => {
    let item: TestItem;
    let sourceIds: TestSourceIdSource[];

    given('I have an item with valid source ids', () => {
      item = {
        ...itemValid,
      };
    });

    when('I prepare the domain source ids', async () => {
      sourceIds = DynamoDbMapper.prepareDomainSourceIds<
        TestItem,
        TestSourceIdSource
      >(item, 'Test', sources);
    });

    then('I should receive a valid list', () => {
      expect(sourceIds).toEqual([
        TestSourceIdSource.check({
          id: 'a123',
          source: 'ALPHA',
        }),
        TestSourceIdSource.check({
          id: 'b234',
          source: 'BETA',
        }),
      ]);
    });
  });

  test('Fail; id is not a valid idSourceValue', ({ given, when, then }) => {
    let item: TestItem;
    let sourceIds: TestSourceIdSource[];
    let error: Error;

    given('I have an item with invalid source ids', () => {
      item = {
        ...itemValid,
        Test_SourceIdALPHA: 'a123',
      };
    });

    when('I prepare the domain source ids', async () => {
      try {
        sourceIds = DynamoDbMapper.prepareDomainSourceIds<
          TestItem,
          TestSourceIdSource
        >(item, 'Test', sources);
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
      expect(sourceIds).toBeUndefined();
    });
  });

  test('Successful preparation of persistence source fields', ({
    given,
    when,
    then,
  }) => {
    let sourceFields: Record<string, string | undefined>;

    given('I have an entity with valid source fields', () => {
      // above
    });

    when('I prepare the persistence source fields', async () => {
      sourceFields =
        DynamoDbMapper.preparePersistenceSourceIdFields<TestSourceIdSource>(
          sourceIdsValid,
          'Test',
          sources
        );
    });

    then('I should receive a valid list', () => {
      expect(sourceFields).toEqual(persistenceSourceFieldsValid);
    });
  });
});
