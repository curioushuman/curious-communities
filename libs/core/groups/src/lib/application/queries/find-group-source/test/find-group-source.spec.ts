import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindGroupSourceQuery,
  FindGroupSourceHandler,
} from '../find-group-source.query';
import { GroupSourceRepositoryRead } from '../../../../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../../../../adapter/implementations/fake/fake.group-source.repository';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';
import { FindGroupSourceDto } from '../find-group-source.dto';
import { GroupSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-source.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-group-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindGroupSourceHandler;
  let findGroupSourceDto: FindGroupSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindGroupSourceHandler,
        LoggableLogger,
        {
          provide: GroupSourceRepositoryRead,
          useClass: FakeGroupSourceRepository,
        },
        {
          provide: GroupSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindGroupSourceHandler>(FindGroupSourceHandler);
  });

  test('Successfully finding a group-source by Source Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupSourceDto = GroupSourceBuilder()
        .exists()
        .buildFindByIdSourceValueGroupSourceDto();
    });

    when('I attempt to find a group-source', async () => {
      result = await handler.execute(
        new FindGroupSourceQuery(findGroupSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group-source by name', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupSourceDto = GroupSourceBuilder()
        .exists()
        .buildFindByNameGroupSourceDto();
    });

    when('I attempt to find a group-source', async () => {
      result = await handler.execute(
        new FindGroupSourceQuery(findGroupSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; group-source not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findGroupSourceDto = GroupSourceBuilder()
        .doesntExist()
        .buildFindByIdSourceValueGroupSourceDto();
    });

    and('the group-source does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a group-source', async () => {
      try {
        await handler.execute(new FindGroupSourceQuery(findGroupSourceDto));
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
      findGroupSourceDto = GroupSourceBuilder()
        .invalid()
        .buildFindByIdSourceValueGroupSourceDto();
    });

    when('I attempt to find a group-source', async () => {
      try {
        await handler.execute(new FindGroupSourceQuery(findGroupSourceDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
