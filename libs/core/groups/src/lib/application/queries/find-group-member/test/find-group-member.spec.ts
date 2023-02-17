import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  InternalRequestInvalidError,
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
import { GroupMemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-member-source.repository.error-factory';
import { GroupMemberRepositoryErrorFactory } from '../../../../adapter/ports/group-member.repository.error-factory';
import { MemberBuilder } from '../../../../test/builders/member.builder';

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
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: GroupMemberRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindGroupMemberHandler>(FindGroupMemberHandler);
  });

  // test('Successfully finding a groupMember by Id', ({ given, and, when }) => {
  //   // disabling no-explicit-any for testing purposes
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   let result: any;

  //   given('the request is valid', () => {
  //     // we know this to exist in our fake repo
  //     findGroupMemberDto = GroupMemberBuilder()
  //       .exists()
  //       .buildFindByIdGroupMemberDto();
  //   });

  //   when('I attempt to find a groupMember', async () => {
  //     result = await handler.execute(
  //       new FindGroupMemberQuery(findGroupMemberDto)
  //     );
  //   });

  //   and('a record should have been returned', () => {
  //     expect(result.id).toBeDefined();
  //   });
  // });

  test('Successfully finding a groupMember by Member Id', ({
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
        .buildFindByMemberIdGroupMemberDto();
    });

    when('I attempt to find a groupMember', async () => {
      try {
        result = await handler.execute(
          new FindGroupMemberQuery(findGroupMemberDto)
        );
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully finding a groupMember by participant Id', ({
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
        .buildFindByParticipantIdGroupMemberDto();
    });

    when('I attempt to find a groupMember', async () => {
      result = await handler.execute(
        new FindGroupMemberQuery(findGroupMemberDto)
      );
    });

    and('a record should have been returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; groupMember not found', ({ given, and, when, then }) => {
    let error: Error;

    given('the request is valid', () => {
      const noExistMember = MemberBuilder().doesntExist().build();
      findGroupMemberDto =
        GroupMemberBuilder().buildFindByMemberIdGroupMemberDto(noExistMember);
    });

    and('the groupMember does NOT exist in the DB', () => {
      // above
    });

    when('I attempt to find a groupMember', async () => {
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
      const invalidMember = MemberBuilder().invalid().build();
      findGroupMemberDto =
        GroupMemberBuilder().buildFindByMemberIdGroupMemberDto(invalidMember);
    });

    when('I attempt to find a groupMember', async () => {
      try {
        await handler.execute(new FindGroupMemberQuery(findGroupMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a InternalRequestInvalidError', () => {
      expect(error).toBeInstanceOf(InternalRequestInvalidError);
    });
  });
});
