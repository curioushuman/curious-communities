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
  UpdateGroupMemberCommand,
  UpdateGroupMemberHandler,
} from '../update-group-member.command';
import { GroupMemberRepository } from '../../../../adapter/ports/group-member.repository';
import { FakeGroupMemberRepository } from '../../../../adapter/implementations/fake/fake.group-member.repository';
import { GroupMemberSourceRepository } from '../../../../adapter/ports/group-member-source.repository';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';
import { UpdateGroupMemberDto } from '../update-group-member.dto';
import { GroupMemberSource } from '../../../../domain/entities/group-member-source';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberRepository;
  let GroupMemberSourcerepository: FakeGroupMemberSourceRepository;
  let handler: UpdateGroupMemberHandler;
  let updateGroupMemberDto: UpdateGroupMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupMemberHandler,
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
    GroupMemberSourcerepository = moduleRef.get<GroupMemberSourceRepository>(
      GroupMemberSourceRepository
    ) as FakeGroupMemberSourceRepository;
    handler = moduleRef.get<UpdateGroupMemberHandler>(UpdateGroupMemberHandler);
  });

  test('Successfully updating a group-member', ({ given, and, when, then }) => {
    let updatedGroupMemberSource: GroupMemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateGroupMemberDto = GroupMemberBuilder()
        .exists()
        .buildUpdateGroupMemberDto();
    });

    and('the returned source populates a valid group-member', async () => {
      // this is an updated version of the `exists()` GroupMemberSource
      updatedGroupMemberSource = GroupMemberSourceBuilder().updated().build();
      // save it to our fake repo, we know it is valid
      executeTask(GroupMemberSourcerepository.save(updatedGroupMemberSource));
    });

    and('the source does exist in our DB', async () => {
      const groupMembers = await executeTask(repository.all());
      const groupMemberBefore = groupMembers.find(
        (groupMember) => groupMember.id === updateGroupMemberDto.id
      );
      expect(groupMemberBefore).toBeDefined();
      if (groupMemberBefore) {
        expect(groupMemberBefore.memberName).not.toEqual(
          updatedGroupMemberSource.memberName
        );
      }
    });

    when('I attempt to update a group-member', async () => {
      result = await handler.execute(
        new UpdateGroupMemberCommand(updateGroupMemberDto)
      );
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const groupMembers = await executeTask(repository.all());
        const groupMemberAfter = groupMembers.find(
          (groupMember) => groupMember.id === updateGroupMemberDto.id
        );
        expect(groupMemberAfter).toBeDefined();
        if (groupMemberAfter) {
          expect(groupMemberAfter.memberName).toEqual(
            updatedGroupMemberSource.memberName
          );
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
      updateGroupMemberDto = GroupMemberBuilder()
        .noMatchingSource()
        .buildUpdateGroupMemberDto();
    });

    when('I attempt to update a group-member', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberCommand(updateGroupMemberDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; GroupMember not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      updateGroupMemberDto = GroupMemberBuilder()
        .alpha()
        .buildUpdateGroupMemberDto();
    });

    and('the returned source populates a valid group-member', () => {
      // we know this to be true
    });

    and('the source does NOT exist in our DB', () => {
      // we know this to be true
    });

    when('I attempt to update a group-member', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberCommand(updateGroupMemberDto)
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
      updateGroupMemberDto = GroupMemberBuilder()
        .invalidSource()
        .buildUpdateGroupMemberDto();
    });

    and('the returned source does not populate a valid GroupMember', () => {
      // this occurs during
    });

    when('I attempt to update a group-member', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberCommand(updateGroupMemberDto)
        );
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
      updateGroupMemberDto = GroupMemberBuilder()
        .invalidStatus()
        .buildUpdateGroupMemberDto();
    });

    when('I attempt to update a group-member', async () => {
      try {
        await handler.execute(
          new UpdateGroupMemberCommand(updateGroupMemberDto)
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
