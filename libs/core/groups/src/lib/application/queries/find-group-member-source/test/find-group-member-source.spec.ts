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
  FindGroupMemberSourceQuery,
  FindGroupMemberSourceHandler,
} from '../find-group-member-source.query';
import {
  GroupMemberSourceCommunityRepository,
  GroupMemberSourceMicroCourseRepository,
} from '../../../../adapter/ports/group-member-source.repository';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { FindGroupMemberSourceDto } from '../find-group-member-source.dto';
import { FakeGroupMemberSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.community.repository';
import { FakeGroupMemberSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.micro-course.repository';

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
          provide: GroupMemberSourceCommunityRepository,
          useClass: FakeGroupMemberSourceCommunityRepository,
        },
        {
          provide: GroupMemberSourceMicroCourseRepository,
          useClass: FakeGroupMemberSourceMicroCourseRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindGroupMemberSourceHandler>(
      FindGroupMemberSourceHandler
    );
  });

  test('Successfully finding a group member source by Source Id', ({
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
        .buildFindByIdSourceValueGroupMemberSourceDto();
    });

    when('I attempt to find a group member source', async () => {
      result = await handler.execute(
        new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a group member source from non-primary source', ({
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
        .alternateSource()
        .buildFindByIdSourceValueGroupMemberSourceDto();
    });

    when('I attempt to find a group member source', async () => {
      result = await handler.execute(
        new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; group member source not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      findGroupMemberSourceDto = GroupMemberSourceBuilder()
        .doesntExist()
        .buildFindByIdSourceValueGroupMemberSourceDto();
    });

    and('the group member source does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a group member source', async () => {
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
        .buildFindByIdSourceValueGroupMemberSourceDto();
    });

    when('I attempt to find a group member source', async () => {
      try {
        await handler.execute(
          new FindGroupMemberSourceQuery(findGroupMemberSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
