import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateGroupCommand,
  UpdateGroupHandler,
} from '../update-group.command';
import { GroupRepository } from '../../../../adapter/ports/group.repository';
import { FakeGroupRepository } from '../../../../adapter/implementations/fake/fake.group.repository';
import { GroupSourceRepository } from '../../../../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../../../../adapter/implementations/fake/fake.group-source.repository';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { UpdateGroupDto } from '../update-group.dto';
import { GroupSource } from '../../../../domain/entities/group-source';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupRepository;
  let groupSourcerepository: FakeGroupSourceRepository;
  let handler: UpdateGroupHandler;
  let updateGroupDto: UpdateGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupHandler,
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
    groupSourcerepository = moduleRef.get<GroupSourceRepository>(
      GroupSourceRepository
    ) as FakeGroupSourceRepository;
    handler = moduleRef.get<UpdateGroupHandler>(UpdateGroupHandler);
  });

  test('Successfully updating a group', ({ given, and, when, then }) => {
    let updatedGroupSource: GroupSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateGroupDto = GroupBuilder().exists().buildUpdateGroupDto();
    });

    and('the returned source populates a valid group', async () => {
      // this is an updated version of the `exists()` groupSource
      updatedGroupSource = GroupSourceBuilder().updated().build();
      // save it to our fake repo, we know it is valid
      executeTask(groupSourcerepository.save(updatedGroupSource));
    });

    and('the source does exist in our DB', async () => {
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) => group.id === updateGroupDto.id
      );
      expect(groupBefore).toBeDefined();
      if (groupBefore) {
        expect(groupBefore.name).not.toEqual(updatedGroupSource.name);
      }
    });

    when('I attempt to update a group', async () => {
      result = await handler.execute(new UpdateGroupCommand(updateGroupDto));
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const groups = await executeTask(repository.all());
        const groupAfter = groups.find(
          (group) => group.id === updateGroupDto.id
        );
        expect(groupAfter).toBeDefined();
        if (groupAfter) {
          expect(groupAfter.name).toEqual(updatedGroupSource.name);
        }
      }
    );

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      updateGroupDto = GroupBuilder().noMatchingSource().buildUpdateGroupDto();
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(new UpdateGroupCommand(updateGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Group not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      updateGroupDto = GroupBuilder().alpha().buildUpdateGroupDto();
    });

    and('the returned source populates a valid group', () => {
      // we know this to be true
    });

    and('the source does NOT exist in our DB', () => {
      // we know this to be true
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(new UpdateGroupCommand(updateGroupDto));
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
      updateGroupDto = GroupBuilder().invalidSource().buildUpdateGroupDto();
    });

    and('the returned source does not populate a valid Group', () => {
      // this occurs during
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(new UpdateGroupCommand(updateGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source is an invalid status to be updated in admin', ({
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
      updateGroupDto = GroupBuilder().invalidStatus().buildUpdateGroupDto();
    });

    when('I attempt to update a group', async () => {
      try {
        await handler.execute(new UpdateGroupCommand(updateGroupDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
