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
  CreateGroupCommand,
  CreateGroupHandler,
} from '../create-group.command';
import { GroupRepository } from '../../../../adapter/ports/group.repository';
import { FakeGroupRepository } from '../../../../adapter/implementations/fake/fake.group.repository';
import { GroupSourceRepository } from '../../../../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../../../../adapter/implementations/fake/fake.group-source.repository';
import { Group } from '../../../../domain/entities/group';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { CreateGroupDto } from '../create-group.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupRepository;
  let handler: CreateGroupHandler;
  let createGroupDto: CreateGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupHandler,
        LoggableLogger,
        { provide: GroupRepository, useClass: FakeGroupRepository },
        {
          provide: GroupSourceRepository,
          useClass: FakeGroupSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    handler = moduleRef.get<CreateGroupHandler>(CreateGroupHandler);
  });

  test('Successfully creating a group', ({ given, and, when, then }) => {
    let groups: Group[];
    let groupsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createGroupDto = GroupBuilder().beta().buildCreateGroupDto();
    });

    and('the returned source populates a valid group', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      groups = await executeTask(repository.all());
      groupsBefore = groups.length;
    });

    when('I attempt to create a group', async () => {
      result = await handler.execute(new CreateGroupCommand(createGroupDto));
    });

    then('a new record should have been created', async () => {
      groups = await executeTask(repository.all());
      expect(groups.length).toEqual(groupsBefore + 1);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createGroupDto = GroupBuilder().noMatchingSource().buildCreateGroupDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await handler.execute(new CreateGroupCommand(createGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Group', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createGroupDto = GroupBuilder().invalidSource().buildCreateGroupDto();
    });

    and('the returned source does not populate a valid Group', () => {
      // this occurs during
    });

    when('I attempt to create a group', async () => {
      try {
        await handler.execute(new CreateGroupCommand(createGroupDto));
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

    and('the returned source populates a valid group', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createGroupDto = GroupBuilder().exists().buildCreateGroupDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await handler.execute(new CreateGroupCommand(createGroupDto));
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
      createGroupDto = GroupBuilder().invalidStatus().buildCreateGroupDto();
    });

    when('I attempt to create a group', async () => {
      try {
        await handler.execute(new CreateGroupCommand(createGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
