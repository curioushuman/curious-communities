import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RepositoryItemConflictError,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateMemberCommand,
  CreateMemberHandler,
} from '../create-member.command';
import { MemberRepository } from '../../../../adapter/ports/member.repository';
import { FakeMemberRepository } from '../../../../adapter/implementations/fake/fake.member.repository';
import { MemberSourceRepository } from '../../../../adapter/ports/member-source.repository';
import { FakeMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.member-source.repository';
import { Member } from '../../../../domain/entities/member';
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { CreateMemberDto } from '../create-member.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeMemberRepository;
  let handler: CreateMemberHandler;
  let createMemberDto: CreateMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMemberHandler,
        LoggableLogger,
        { provide: MemberRepository, useClass: FakeMemberRepository },
        {
          provide: MemberSourceRepository,
          useClass: FakeMemberSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    handler = moduleRef.get<CreateMemberHandler>(CreateMemberHandler);
  });

  test('Successfully creating a member', ({ given, and, when, then }) => {
    let members: Member[];
    let membersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createMemberDto = MemberBuilder().beta().buildCreateMemberDto();
    });

    and('the returned source populates a valid member', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      members = await executeTask(repository.all());
      membersBefore = members.length;
    });

    when('I attempt to create a member', async () => {
      result = await handler.execute(new CreateMemberCommand(createMemberDto));
    });

    then('a new record should have been created', async () => {
      members = await executeTask(repository.all());
      expect(members.length).toEqual(membersBefore + 1);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createMemberDto = MemberBuilder()
        .noMatchingSource()
        .buildCreateMemberDto();
    });

    when('I attempt to create a member', async () => {
      try {
        await handler.execute(new CreateMemberCommand(createMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Member', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createMemberDto = MemberBuilder().invalidSource().buildCreateMemberDto();
    });

    and('the returned source does not populate a valid Member', () => {
      // this occurs during
    });

    when('I attempt to create a member', async () => {
      try {
        await handler.execute(new CreateMemberCommand(createMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source already exists in our DB', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // confirmed
    });

    and('the returned source populates a valid member', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createMemberDto = MemberBuilder().exists().buildCreateMemberDto();
    });

    when('I attempt to create a member', async () => {
      try {
        await handler.execute(new CreateMemberCommand(createMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive an RepositoryItemConflictError', () => {
      expect(error).toBeInstanceOf(RepositoryItemConflictError);
    });
  });

  test('Fail; Source is an invalid status to be created in admin', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this
    });

    and('the returned source has an invalid status', () => {
      createMemberDto = MemberBuilder().invalidStatus().buildCreateMemberDto();
    });

    when('I attempt to create a member', async () => {
      try {
        await handler.execute(new CreateMemberCommand(createMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
