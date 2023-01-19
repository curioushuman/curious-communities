import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindGroupMemberQuery,
  FindGroupMemberHandler,
} from '../find-group-member.query';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { FindGroupMemberDto } from '../find-group-member.dto';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindGroupMemberHandler;
  let findGroupMemberDto: FindGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindGroupMemberHandler,
        LoggableLogger,
        { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindGroupMemberHandler>(FindGroupMemberHandler);
  });

  test('Successfully finding a group member by Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupMemberDto = GroupMemberBuilder()
        .exists()
        .buildFindByIdGroupMemberDto();
    });

    when('I attempt to find a group member', async () => {
      result = await handler.execute(
        new FindGroupMemberQuery(findGroupMemberDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group member by Source Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupMemberDto = GroupMemberBuilder()
        .exists()
        .buildFindByIdSourceValueGroupMemberDto();
    });

    when('I attempt to find a group member', async () => {
      result = await handler.execute(
        new FindGroupMemberQuery(findGroupMemberDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group member by entity', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupMemberDto = GroupMemberBuilder()
        .exists()
        .buildFindByEntityGroupMemberDto();
    });

    when('I attempt to find a group member', async () => {
      result = await handler.execute(
        new FindGroupMemberQuery(findGroupMemberDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; group member not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findGroupMemberDto = GroupMemberBuilder()
        .doesntExist()
        .buildFindByIdSourceValueGroupMemberDto();
    });

    and('the group member does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a group member', async () => {
      try {
        await handler.execute(new FindGroupMemberQuery(findGroupMemberDto));
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
      findGroupMemberDto = GroupMemberBuilder()
        .invalid()
        .buildFindByIdSourceValueGroupMemberDto();
    });

    when('I attempt to find a group member', async () => {
      try {
        await handler.execute(new FindGroupMemberQuery(findGroupMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
