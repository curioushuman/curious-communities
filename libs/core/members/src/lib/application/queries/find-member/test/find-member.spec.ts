import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindMemberQuery, FindMemberHandler } from '../find-member.query';
import { MemberRepository } from '../../../../adapter/ports/member.repository';
import { FakeMemberRepository } from '../../../../adapter/implementations/fake/fake.member.repository';
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { FindMemberDto } from '../find-member.dto';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindMemberHandler;
  let findMemberDto: FindMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindMemberHandler,
        LoggableLogger,
        { provide: MemberRepository, useClass: FakeMemberRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindMemberHandler>(FindMemberHandler);
  });

  test('Successfully finding a member by Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder().exists().buildFindByIdMemberDto();
    });

    when('I attempt to find a member', async () => {
      result = await handler.execute(new FindMemberQuery(findMemberDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a member by Source Id', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder()
        .exists()
        .buildFindByIdSourceValueMemberDto();
    });

    when('I attempt to find a member', async () => {
      result = await handler.execute(new FindMemberQuery(findMemberDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a member by email', ({ given, and, when }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      findMemberDto = MemberBuilder().exists().buildFindByEmailMemberDto();
    });

    when('I attempt to find a member', async () => {
      result = await handler.execute(new FindMemberQuery(findMemberDto));
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      findMemberDto = MemberBuilder()
        .invalid()
        .buildFindByIdSourceValueMemberDto();
    });

    when('I attempt to find a member', async () => {
      try {
        await handler.execute(new FindMemberQuery(findMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
