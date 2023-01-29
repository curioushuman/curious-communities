import { loadFeature, defineFeature } from 'jest-cucumber';

import { DynamoDbMapper } from '../dynamodb.mapper';
import { TestSourceIdSource } from './value-objects//test-source-id-source';

type TestItem = {
  primaryKey: string;
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
  let item: TestItem;
  let sourceIds: TestSourceIdSource[];

  test('Successful preparation of domain source ids', ({
    given,
    when,
    then,
  }) => {
    given('I have an item with valid source ids', () => {
      item = {
        primaryKey: 'test1',
        sortKey: 'test2',
        Test_SourceIdALPHA: 'ALPHA#a123',
        Test_SourceIdBETA: 'BETA#b234',
      };
    });

    when('I prepare the domain source ids', async () => {
      sourceIds = DynamoDbMapper.prepareDomainSourceIds<
        TestItem,
        TestSourceIdSource
      >(item, 'Test', ['ALPHA', 'BETA']);
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
});
