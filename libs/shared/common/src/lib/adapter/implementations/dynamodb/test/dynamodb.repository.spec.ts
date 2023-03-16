import { LoggableLogger } from '@curioushuman/loggable';
import { DynamoDbRepository } from '../repository';
// unused as it is only imported to be mocked
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as functions from '../../../../utils/functions';
import { RepositoryServerError } from '@curioushuman/error-factory';
import {
  DDBQueryAllValueBeginsWith,
  DDBQueryAllValueWithOperator,
  DynamoDbRepositoryFindAllProps,
  DynamoDbRepositoryQueryAllProps,
  DynamoDbRepositoryQueryOneProps,
} from '../__types__';

/**
 * Mocks
 */
jest.mock('../../../../utils/functions', () => {
  const originalModule = jest.requireActual('../../../../utils/functions');
  return {
    __esModule: true,
    ...originalModule,
    confirmEnvVars: jest.fn(),
  };
});

/**
 * Types used for testing
 */

type TestEntity = {
  id: string;
  name: string;
  lastName: string;
  age: number;
};

type TestEntityPersisted = {
  Test_Id: string;
  Member_Name: string;
  Test_LastName: string;
  Sk_Test_LastName: string;
  Test_Age: number;
};

// type TestItem = {
//   Test_Id: string;
//   Test_Name: string;
// };

/**
 * UNIT TEST
 * SUT = DynamoDbRepository
 */

describe('DynamoDbRepository', () => {
  let dynamoDbRepository: DynamoDbRepository<TestEntity, TestEntityPersisted>;
  const entityName = 'Test';
  const tableName = 'CcTestsDynamoDbTable';

  beforeAll(() => {
    dynamoDbRepository = new DynamoDbRepository(
      {
        entityId: 'test',
        tableId: 'tests',
        localIndexes: ['last-name'],
        globalIndexes: [
          'last-name',
          {
            id: 'name',
            sortKey: 'Test_Id',
            partitionKey: 'Member_Name',
          },
        ],
        prefix: 'cc',
      },
      new LoggableLogger('TEST')
    );
  });

  describe('prepareParamsQueryOne', () => {
    describe('when no index specified', () => {
      it('should query the table, using standard partitionKey', () => {
        const props: DynamoDbRepositoryQueryOneProps = {
          value: 'partitionKey value',
        };
        const expected = {
          KeyConditionExpression: 'partitionKey = :pk',
          FilterExpression: 'entityType = :ent',
          ExpressionAttributeValues: {
            ':pk': props.value,
            ':ent': entityName,
          },
          TableName: tableName,
          IndexName: undefined,
        };
        const actual = dynamoDbRepository.prepareParamsQueryOne(props);
        expect(actual).toMatchObject(expected);
      });
    });
    // NOTE: we wouldn't use a local index for querying a single item
    describe('when global index specified, initiated by id only', () => {
      it('should query the index, with default partitionKey', () => {
        const props: DynamoDbRepositoryQueryOneProps = {
          indexId: 'last-name',
          value: 'partitionKey value',
        };
        const expected = {
          KeyConditionExpression: 'Test_LastName = :pk',
          FilterExpression: 'entityType = :ent',
          ExpressionAttributeValues: {
            ':pk': props.value,
            ':ent': entityName,
          },
          TableName: tableName,
          IndexName: 'CcTestsTestLastNameDynamoDbGSI',
        };
        const actual = dynamoDbRepository.prepareParamsQueryOne(props);
        expect(actual).toMatchObject(expected);
      });
    });
    describe('when global index specified, initiated with custom definition', () => {
      it('should query the index, with custom partitionKey', () => {
        const props: DynamoDbRepositoryQueryOneProps = {
          indexId: 'name',
          value: 'partitionKey value',
        };
        const expected = {
          KeyConditionExpression: 'Member_Name = :pk',
          FilterExpression: 'entityType = :ent',
          ExpressionAttributeValues: {
            ':pk': props.value,
            ':ent': entityName,
          },
          TableName: tableName,
          IndexName: 'CcTestsTestNameDynamoDbGSI',
        };
        const actual = dynamoDbRepository.prepareParamsQueryOne(props);
        expect(actual).toMatchObject(expected);
      });
    });
    describe('when invalid index specified', () => {
      it('should throw an error', () => {
        const props: DynamoDbRepositoryQueryOneProps = {
          indexId: 'no-existy',
          value: 'no matter',
        };
        try {
          dynamoDbRepository.prepareParamsQueryOne(props);
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryServerError);
        }
      });
    });
  });

  describe('prepareParamsQueryAll', () => {
    describe('when no index specified', () => {
      it('should query the table, using standard partitionKey and sortKey', () => {
        const props: DynamoDbRepositoryQueryAllProps = {
          partitionKeyValue: 'partitionKey value',
          sortKeyValue: 'sortKey value',
        };
        const expected = {
          KeyConditionExpression: 'partitionKey = :pk AND sortKey = :sk',
          FilterExpression: 'entityType = :ent',
          ExpressionAttributeValues: {
            ':pk': props.partitionKeyValue,
            ':sk': props.sortKeyValue,
            ':ent': entityName,
          },
          TableName: tableName,
          IndexName: undefined,
        };
        const actual = dynamoDbRepository.prepareParamsQueryAll(props);
        expect(actual).toMatchObject(expected);
      });
    });
    // NOTE: we wouldn't use a local index for querying (at this time)
    describe('when global index specified, initiated by id only, using operator', () => {
      it('should query the index, with default partitionKey and sortKey (by operator)', () => {
        const sortKeyValue: DDBQueryAllValueWithOperator = {
          operator: '>',
          value: 0,
        };
        const props: DynamoDbRepositoryQueryAllProps = {
          indexId: 'last-name',
          partitionKeyValue: 'partitionKey value',
          sortKeyValue,
        };
        const expected = {
          KeyConditionExpression:
            'Test_LastName = :pk AND Sk_Test_LastName > :sk',
          FilterExpression: 'entityType = :ent',
          ExpressionAttributeValues: {
            ':pk': props.partitionKeyValue,
            ':sk': sortKeyValue.value,
            ':ent': entityName,
          },
          TableName: tableName,
          IndexName: 'CcTestsTestLastNameDynamoDbGSI',
        };
        const actual = dynamoDbRepository.prepareParamsQueryAll(props);
        expect(actual).toMatchObject(expected);
      });
    });
    describe('when global index specified, initiated by custom definition, with range filter', () => {
      it('should query the index, with default partitionKey, no sortKey, and range filter', () => {
        const rangeFilter = {
          start: 10,
          end: 20,
        };
        const props: DynamoDbRepositoryQueryAllProps = {
          indexId: 'name',
          partitionKeyValue: 'partitionKey value',
          filters: {
            Test_Age: rangeFilter,
          },
        };
        const expected = {
          KeyConditionExpression: 'Member_Name = :pk',
          FilterExpression:
            'entityType = :ent AND Test_Age BETWEEN :aStart AND :aEnd',
          ExpressionAttributeValues: {
            ':pk': props.partitionKeyValue,
            ':ent': entityName,
            ':aStart': rangeFilter.start,
            ':aEnd': rangeFilter.end,
          },
          TableName: tableName,
          IndexName: 'CcTestsTestNameDynamoDbGSI',
        };
        const actual = dynamoDbRepository.prepareParamsQueryAll(props);
        expect(actual).toMatchObject(expected);
      });
    });
  });
  describe('prepareParamsQueryAll', () => {
    describe('when partitionKey included, no index specified', () => {
      it('should query the table, using standard partitionKey', () => {
        const props: DynamoDbRepositoryFindAllProps = {
          partitionKeyValue: 'partitionKey value',
        };
        const expected = {
          KeyConditionExpression: 'partitionKey = :pk',
          FilterExpression: 'entityType = :ent',
          ExpressionAttributeValues: {
            ':pk': props.partitionKeyValue,
            ':ent': entityName,
          },
          TableName: tableName,
          IndexName: undefined,
        };
        const actual = dynamoDbRepository.prepareParamsFindAll(props);
        expect(actual).toMatchObject(expected);
      });
    });
    describe('when partitionKey NOT included, global index specified, initiated by id only, using begins_with', () => {
      it('should query the index, with NO partitionKey OR sortKey, with begins_with filter', () => {
        const beginsWith: DDBQueryAllValueBeginsWith = {
          operator: 'begins_with',
          value: 'BEGINNING',
        };
        const props: DynamoDbRepositoryFindAllProps = {
          indexId: 'last-name',
          filters: {
            Member_Name: beginsWith,
          },
        };
        const expected = {
          FilterExpression:
            'entityType = :ent AND begins_with(Member_Name, :a)',
          ExpressionAttributeValues: {
            ':ent': entityName,
            ':a': beginsWith.value,
          },
          TableName: tableName,
          IndexName: 'CcTestsTestLastNameDynamoDbGSI',
        };
        const actual = dynamoDbRepository.prepareParamsFindAll(props);
        expect(actual).toMatchObject(expected);
      });
    });
    describe('when sortKey included, without partitionKey', () => {
      it('should throw an error', () => {
        const props: DynamoDbRepositoryFindAllProps = {
          sortKeyValue: 'naughty, naughty',
        };
        try {
          dynamoDbRepository.prepareParamsFindAll(props);
        } catch (error) {
          expect(error).toBeInstanceOf(RepositoryServerError);
        }
      });
    });
  });
});
