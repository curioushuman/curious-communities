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
  CreateGroupMemberCommand,
  CreateGroupMemberHandler,
} from '../create-group-member.command';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberSourceRepository } from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMember } from '../../../../domain/entities/group-member';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { CreateGroupMemberDto } from '../create-group-member.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberRepository;
  let handler: CreateGroupMemberHandler;
  let createGroupMemberDto: CreateGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupMemberHandler,
        LoggableLogger,
        { provide: GroupMemberRepository, useClass: FakeGroupMemberRepository },
        {
          provide: GroupMemberSourceRepository,
          useClass: FakeGroupMemberSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberRepository>(
      GroupMemberRepository
    ) as FakeGroupMemberRepository;
    handler = moduleRef.get<CreateGroupMemberHandler>(CreateGroupMemberHandler);
  });

  test('Successfully creating a group-member', ({ given, and, when, then }) => {
    let groupMembers: GroupMember[];
    let groupMembersBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createGroupMemberDto = GroupMemberBuilder()
        .beta()
        .buildCreateGroupMemberDto();
    });

    and('the returned source populates a valid group-member', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      groupMembers = await executeTask(repository.all());
      groupMembersBefore = groupMembers.length;
    });

    when('I attempt to create a group-member', async () => {
      result = await handler.execute(
        new CreateGroupMemberCommand(createGroupMemberDto)
      );
    });

    then('a new record should have been created', async () => {
      groupMembers = await executeTask(repository.all());
      expect(groupMembers.length).toEqual(groupMembersBefore + 1);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createGroupMemberDto = GroupMemberBuilder()
        .noMatchingSource()
        .buildCreateGroupMemberDto();
    });

    when('I attempt to create a group-member', async () => {
      try {
        await handler.execute(
          new CreateGroupMemberCommand(createGroupMemberDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid GroupMember', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createGroupMemberDto = GroupMemberBuilder()
        .invalidSource()
        .buildCreateGroupMemberDto();
    });

    and('the returned source does not populate a valid GroupMember', () => {
      // this occurs during
    });

    when('I attempt to create a group-member', async () => {
      try {
        await handler.execute(
          new CreateGroupMemberCommand(createGroupMemberDto)
        );
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

    and('the returned source populates a valid group-member', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createGroupMemberDto = GroupMemberBuilder()
        .exists()
        .buildCreateGroupMemberDto();
    });

    when('I attempt to create a group-member', async () => {
      try {
        await handler.execute(
          new CreateGroupMemberCommand(createGroupMemberDto)
        );
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
      createGroupMemberDto = GroupMemberBuilder()
        .invalidStatus()
        .buildCreateGroupMemberDto();
    });

    when('I attempt to create a group-member', async () => {
      try {
        await handler.execute(
          new CreateGroupMemberCommand(createGroupMemberDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
