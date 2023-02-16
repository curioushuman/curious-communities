import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  InternalRequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateGroupMemberSourceCommand,
  CreateGroupMemberSourceHandler,
} from '../create-group-member-source.command';
import { GroupMemberSourceRepositoryReadWrite } from '../../../../adapter/ports/group-member-source.repository';
import { GroupMemberSource } from '../../../../domain/entities/group-member-source';
import { GroupMemberSourceBuilder } from '../../../../test/builders/group-member-source.builder';
import { CreateGroupMemberSourceDto } from '../create-group-member-source.dto';
import { FakeGroupMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.group-member-source.repository';
import { GroupMemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-member-source.repository.error-factory';
import { GroupMemberBuilder } from '../../../../test/builders/group-member.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-group-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupMemberSourceRepository;
  let handler: CreateGroupMemberSourceHandler;
  let createGroupMemberSourceDto: CreateGroupMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGroupMemberSourceHandler,
        LoggableLogger,
        {
          provide: GroupMemberSourceRepositoryReadWrite,
          useClass: FakeGroupMemberSourceRepository,
        },
        {
          provide: GroupMemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupMemberSourceRepositoryReadWrite>(
      GroupMemberSourceRepositoryReadWrite
    ) as FakeGroupMemberSourceRepository;
    handler = moduleRef.get<CreateGroupMemberSourceHandler>(
      CreateGroupMemberSourceHandler
    );
  });

  test('Successfully creating a group member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupMemberSources: GroupMemberSource[];
    let groupMemberSourcesBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      createGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildCreateGroupMemberSourceDto();

      groupMemberSources = await executeTask(repository.all());
      groupMemberSourcesBefore = groupMemberSources.length;
    });

    when('I attempt to create a group member source', async () => {
      result = await handler.execute(
        new CreateGroupMemberSourceCommand(createGroupMemberSourceDto)
      );
    });

    then('a new record should have been created', async () => {
      groupMemberSources = await executeTask(repository.all());
      expect(groupMemberSources.length).toEqual(groupMemberSourcesBefore + 1);
    });

    and('saved group member source is returned', () => {
      expect(result.memberId).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      const groupMember = GroupMemberBuilder().invalidOther().build();
      createGroupMemberSourceDto =
        GroupMemberSourceBuilder().buildCreateGroupMemberSourceDto(groupMember);
    });

    when('I attempt to create a group member source', async () => {
      try {
        await handler.execute(
          new CreateGroupMemberSourceCommand(createGroupMemberSourceDto)
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
