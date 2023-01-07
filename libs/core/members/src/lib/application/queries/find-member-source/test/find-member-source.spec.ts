import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  FindMemberSourceQuery,
  FindMemberSourceHandler,
} from '../find-member-source.query';
import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
} from '../../../../adapter/ports/member-source.repository';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { FindMemberSourceDto } from '../find-member-source.dto';
import { FakeMemberSourceAuthRepository } from '../../../../adapter/implementations/fake/fake.member-source.auth.repository';
import { FakeMemberSourceCrmRepository } from '../../../../adapter/implementations/fake/fake.member-source.crm.repository';
import { FakeMemberSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.member-source.community.repository';
import { FakeMemberSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.member-source.micro-course.repository';

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
          provide: MemberSourceCrmRepository,
          useClass: FakeMemberSourceCrmRepository,
        },
        {
          provide: MemberSourceAuthRepository,
          useClass: FakeMemberSourceAuthRepository,
        },
        {
          provide: MemberSourceCommunityRepository,
          useClass: FakeMemberSourceCommunityRepository,
        },
        {
          provide: MemberSourceMicroCourseRepository,
          useClass: FakeMemberSourceMicroCourseRepository,
        },
        {
          provide: ErrorFactory,
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
        .buildFindByIdSourceValueMemberDto();
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
        .buildFindByEmailMemberDto();
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

  test('Successfully finding a member source from non-primary source', ({
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
        .alternateSource()
        .buildFindByIdSourceValueMemberDto();
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

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      findMemberSourceDto = MemberSourceBuilder()
        .invalid()
        .buildFindByIdSourceValueMemberDto();
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
