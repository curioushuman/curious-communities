import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindMemberSourceQuery,
  FindMemberSourceHandler,
} from '../find-member-source.query';
import { MemberSourceRepository } from '../../../../adapter/ports/member-source.repository';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { FindMemberSourceDto } from '../find-member-source.dto';
import { FakeMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/member-source.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindMemberSourceHandler;
  let findMemberSourceDto: FindMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindMemberSourceHandler,
        LoggableLogger,
        {
          provide: MemberSourceRepository,
          useClass: FakeMemberSourceRepository,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindMemberSourceHandler>(FindMemberSourceHandler);
  });

  test('Successfully finding a member source by Source Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberSourceDto = MemberSourceBuilder()
        .exists()
        .buildFindByIdSourceValueMemberSourceDto();
    });

    when('I attempt to find a member source', async () => {
      result = await handler.execute(
        new FindMemberSourceQuery(findMemberSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a member source by email', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberSourceDto = MemberSourceBuilder()
        .exists()
        .buildFindByEmailMemberSourceDto();
    });

    when('I attempt to find a member source', async () => {
      result = await handler.execute(
        new FindMemberSourceQuery(findMemberSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; member source not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findMemberSourceDto = MemberSourceBuilder()
        .doesntExist()
        .buildFindByIdSourceValueMemberSourceDto();
    });

    and('the member source does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a member source', async () => {
      try {
        await handler.execute(new FindMemberSourceQuery(findMemberSourceDto));
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
      findMemberSourceDto = MemberSourceBuilder()
        .invalid()
        .buildFindByIdSourceValueMemberSourceDto();
    });

    when('I attempt to find a member source', async () => {
      try {
        await handler.execute(new FindMemberSourceQuery(findMemberSourceDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
