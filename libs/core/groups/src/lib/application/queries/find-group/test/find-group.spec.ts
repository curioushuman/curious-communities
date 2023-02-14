import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindGroupQuery, FindGroupHandler } from '../find-group.query';
import { GroupRepository } from '../../../../adapter/ports/group.repository';
import { FakeGroupRepository } from '../../../../adapter/implementations/fake/fake.group.repository';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { FindGroupDto } from '../find-group.dto';
import { GroupRepositoryErrorFactory } from '../../../../adapter/ports/group.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindGroupHandler;
  let findGroupDto: FindGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindGroupHandler,
        LoggableLogger,
        { provide: GroupRepository, useClass: FakeGroupRepository },
        {
          provide: GroupRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindGroupHandler>(FindGroupHandler);
  });

  test('Successfully finding a group by Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder().exists().buildFindByIdGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(new FindGroupQuery(findGroupDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group by Source Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder().exists().buildFindByIdSourceValueGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(new FindGroupQuery(findGroupDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group by slug', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder().exists().buildFindBySlugGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(new FindGroupQuery(findGroupDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group by Course Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupDto = GroupBuilder()
        .existsCourse()
        .buildFindByCourseIdGroupDto();
    });

    when('I attempt to find a group', async () => {
      result = await handler.execute(new FindGroupQuery(findGroupDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; group not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findGroupDto = GroupBuilder()
        .doesntExist()
        .buildFindByIdSourceValueGroupDto();
    });

    and('the group does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a group', async () => {
      try {
        await handler.execute(new FindGroupQuery(findGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      findGroupDto = GroupBuilder()
        .invalid()
        .buildFindByIdSourceValueGroupDto();
    });

    when('I attempt to find a group', async () => {
      try {
        await handler.execute(new FindGroupQuery(findGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
