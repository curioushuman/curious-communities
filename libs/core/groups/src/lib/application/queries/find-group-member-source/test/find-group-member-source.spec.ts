import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindGroupMemberSourceQuery,
  FindGroupMemberSourceHandler,
} from '../find-group-member-source.query';
import { GroupMemberSourceRepositoryRead } from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { FindGroupMemberSourceDto } from '../find-group-member-source.dto';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-member-source.repository.error-factory';
import { GroupMemberRepositoryErrorFactory } from '../../../../adapter/ports/group-member.repository.error-factory';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-group-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindGroupMemberSourceHandler;
  let findGroupMemberSourceDto: FindGroupMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindGroupMemberSourceHandler,
        LoggableLogger,
        {
          provide: GroupMemberSourceRepositoryRead,
          useClass: FakeGroupMemberSourceRepository,
        },
        {
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: GroupMemberRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindGroupMemberSourceHandler>(
      FindGroupMemberSourceHandler
    );
  });

  test('Successfully finding a groupMember source by Member Id', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupMemberSourceDto = GroupMemberSourceBuilder()
        .exists()
        .buildFindByMemberIdGroupMemberSourceDto();
    });

    when('I attempt to find a groupMember source', async () => {
      result = await handler.execute(
        new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Successfully finding a groupMember source by Member email', ({
    given,
    and,
    when,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findGroupMemberSourceDto = GroupMemberSourceBuilder()
        .exists()
        .buildFindByEmailGroupMemberSourceDto();
    });

    when('I attempt to find a groupMember source', async () => {
      result = await handler.execute(
        new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Fail; groupMember source not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findGroupMemberSourceDto = GroupMemberSourceBuilder()
        .doesntExist()
        .buildFindByEmailGroupMemberSourceDto();
    });

    and('the groupMember source does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a groupMember source', async () => {
      try {
        await handler.execute(
          new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
        );
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
      findGroupMemberSourceDto = GroupMemberSourceBuilder()
        .invalid()
        .buildFindByMemberIdGroupMemberSourceDto();
    });

    when('I attempt to find a groupMember source', async () => {
      try {
        await handler.execute(
          new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
